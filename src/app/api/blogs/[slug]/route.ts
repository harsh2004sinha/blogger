import { service } from "@/lib/service";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/services/errorResponse";
import { SuccessResponse } from "@/services/succesResponse";
import { BlogSchema } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const { slug } = (await params) as { slug?: string };
        if (!slug) return ErrorResponse("Slug is required", 400);

        const post = await service.getBlog(slug);

        if (!post) return ErrorResponse("Post not found", 404);

        const payload = {
            id: post.id,
            slug: post.slug,
            title: post.title,
            content: post.content,
            status: post.status,
            featuredImage: post.featuredImage,
            imageId: post.imageId,
            category: post.category?.displayName ?? "",
        };

        return SuccessResponse(payload, 200);

    } catch (error) {
        console.error("GET :: api/blogs/[slug] :: error", error);
        return ErrorResponse("Failed to fetch Blog", 500);
    }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) return ErrorResponse("Unauthorized User", 401);

        const { slug } = params;

        const form = await req.formData();
        const rawTitle = form.get("title") as string | null;
        const rawContent = form.get("content") as string | null;
        const rawStatus = form.get("status") as string | null;
        const rawCategory = (form.get("categoryName") ?? form.get("category")) as string | null;
        const image = form.get("featuredImage") as any | null;

        const normalized = {
            title: rawTitle ?? undefined,
            content: rawContent ?? undefined,
            status: typeof rawStatus === "string" ? (rawStatus === "true") : undefined,
            categoryName: rawCategory ? String(rawCategory).trim() : undefined,
        };

        const existingBlog = await service.getBlog(slug);

        if (!existingBlog) return ErrorResponse("Post Not Found", 404);
        if (existingBlog.authorId !== userId) return ErrorResponse("Forbidden", 403);

        const parsed = BlogSchema.partial().safeParse(normalized);
        if (!parsed.success) {
            console.log("PUT validation failed:", parsed.error.issues);
            return ErrorResponse(parsed.error.issues[0]?.message || "Invalid input", 400);
        }

        let featuredImage: string | undefined = undefined;
        let imageId: string | undefined = undefined;

        if (image && typeof image === "object" && typeof image.arrayBuffer === "function") {

            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mime = image.type || "application/octet-stream";
            const b64 = buffer.toString("base64");
            const dataUri = `data:${mime};base64,${b64}`;

            const uploadResult = await service.uploadFile(dataUri);
            if (uploadResult && Array.isArray(uploadResult)) {
                [featuredImage, imageId] = uploadResult;
            } else {
                console.error("Image upload failed");
            }
        } else if (image && typeof image === "string") {
            featuredImage = image;
        }

        const updatedPost = await service.updateBlog(slug,
            {
                id: userId,
                title: parsed.data.title,
                content: parsed.data.content,
                status: parsed.data.status,
                categoryName: parsed.data.categoryName,
                featuredImage: featuredImage,
                imageId: imageId,
            }
        );
        return SuccessResponse(updatedPost, 200, "Update Successful");

    } catch (error) {
        console.error("PUT :: api/blogs/[slug] :: error");
        return ErrorResponse("Failed to update Blog", 500);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) return ErrorResponse("Unauthorized User", 401);

        const existingBlog = await service.getBlog(params.slug);

        if (!existingBlog) return ErrorResponse("Post Not Found", 404);
        if (existingBlog.authorId !== userId) return ErrorResponse("Forbidden", 403);

        const deleted = await service.deleteBlog(params.slug);
        return SuccessResponse(deleted, 200, "Post Deleted Successfully");

    } catch (error) {
        console.error("DELETE :: api/blogs/[slug] :: error");
        return ErrorResponse("Failed to delete Blog", 500);
    }
}
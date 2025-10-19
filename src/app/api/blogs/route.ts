import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { service } from "@/lib/service";
import { SuccessResponse } from "@/services/succesResponse";
import { ErrorResponse } from "@/services/errorResponse";
import { BlogSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            console.log("Unauthorized User");
            return ErrorResponse("Unauthorized User", 401);
        }

        const form = await req.formData();


        const title = form.get("title") as string | null;
        const content = form.get("content") as string | null;
        const statusRaw = form.get("status") as string | null;
        const categoryName = form.get("categoryName") as string | null;

        const status = statusRaw === "true";

        const file = form.get("featuredImage") as unknown as File | null;

        const payloadForValidation = { title, content, status, categoryName };

        const parsed = BlogSchema.safeParse(payloadForValidation);

        if (!parsed.success) {
            console.log("Request body:", payloadForValidation);
            console.log("Request body validation error: ", parsed.error.issues[0]?.message);

            return ErrorResponse(parsed.error.issues[0]?.message || "Invalid Input", 400);
        }

        let imageUrl: string | null = null;
        let imageId: string | null = null;

        if (file && (file as any).size) {
            const arrayBuffer = await (file as any).arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const b64 = buffer.toString("base64");
            const mime = (file as any).type || "application/octet-stream";
            const dataUri = `data:${mime};base64,${b64}`;

            const uploadResult = await service.uploadFile(dataUri);
            if (uploadResult && Array.isArray(uploadResult)) {
                [imageUrl, imageId] = uploadResult;
            }
        }

        const newBlog = await service.createBlog({
            title: parsed.data.title,
            content: parsed.data.content,
            featuredImage: imageUrl,
            status: parsed.data.status,
            imageId,
            userId,
            categoryName: parsed.data.categoryName,
        });

        return SuccessResponse(newBlog, 201, "Blog created successfully");

    } catch (error) {
        console.error("POST :: api/blogs :: error", error);
        return ErrorResponse("Failed to create Blog", 500);
    }
}

export async function GET() {
    try {
        const blogs = await service.getBlogs();
        return SuccessResponse(blogs, 200);

    } catch (error) {
        console.error("GET :: api/blogs :: error", error);
        return ErrorResponse("Failed to fetch Blog", 500);
    }
}
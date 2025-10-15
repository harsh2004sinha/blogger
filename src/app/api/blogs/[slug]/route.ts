import { service } from "@/lib/service";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/services/errorResponse";
import { SuccessResponse } from "@/services/succesResponse";
import { BlogSchema } from "@/lib/validation";

export async function GET(req: NextRequest, {params}: {params: {slug: string}}){
    try {
        const post = await service.getBlog(params.slug);

        if(!post) return ErrorResponse("Post not Found",401);

        return SuccessResponse(post, 200);

    } catch (error) {
        console.error("GET :: api/blogs/[slug] :: error", error);
        return ErrorResponse("Failed to fetch Blog",500);
    }
}

export async function PUT(req:NextRequest, {params} : {params : {slug: string}}) {
    try {
        const { userId } = await auth();
        if(!userId) return ErrorResponse("Unauthorized User", 401);

        const body = await req.json();
        const existingBlog = await service.getBlog(params.slug);

        if(!existingBlog) return ErrorResponse("Post Not Found", 404);
        if(existingBlog.authorId !== userId) return ErrorResponse("Forbidden", 403);

        const parsed = BlogSchema.partial().safeParse(body);
        if(!parsed.success) return ErrorResponse(parsed.error.issues[0]?.message || "Invalid Input", 400);

        const updatedPost = await service.updateBlog(params.slug, parsed.data);
        return SuccessResponse(updatedPost, 200, "Update Successful");
        
    } catch (error) {
        console.error("PUT :: api/blogs/[slug] :: error");
        return ErrorResponse("Failed to update Blog",500);
    }
}

export async function DELETE(req: NextRequest, {params} : {params : {slug : string}}) {
    try {
        const { userId } = await auth();
        if(!userId) return ErrorResponse("Unauthorized User", 401);

        const existingBlog = await service.getBlog(params.slug);

        if(!existingBlog) return ErrorResponse("Post Not Found", 404);
        if(existingBlog.authorId !== userId) return ErrorResponse("Forbidden", 403);

        const deleted = await service.deleteBlog(params.slug);
        return SuccessResponse(deleted, 200, "Post Deleted Successfully");

    } catch (error) {
        console.error("DELETE :: api/blogs/[slug] :: error");
        return ErrorResponse("Failed to delete Blog", 500);
    }
}
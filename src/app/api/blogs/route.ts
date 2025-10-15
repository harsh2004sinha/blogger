import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { service } from "@/lib/service";
import { SuccessResponse } from "@/services/succesResponse";
import { ErrorResponse } from "@/services/errorResponse";
import { BlogSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if(!userId){
            console.log("Unauthorized User");
            return ErrorResponse("Unauthorized User", 401);
        }

        const body = await req.json();
        const parsed = BlogSchema.safeParse(body);

        if(!parsed.success){
            console.log("Request body:", body);
            console.log(parsed.error.issues[0]?.message);

            return ErrorResponse(parsed.error.issues[0]?.message || "Invalid Input", 400);
        }

        const {title, content, featuredImage, status, imageId, categoryName} = parsed.data;

        const newBlog = await service.createBlog({
            title,
            content,
            featuredImage,
            status,
            imageId,
            userId,
            categoryName,
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
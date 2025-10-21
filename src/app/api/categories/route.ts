import { prisma } from "@/lib/prisma";
import { ErrorResponse } from "@/services/errorResponse";
import { SuccessResponse } from "@/services/succesResponse";


export async function GET(){
    try {
        const categories = await prisma.category.findMany();
        return SuccessResponse(categories, 200);
    } catch (error) {
        console.error("GET :: api/categories :: error", error);
        return ErrorResponse("Failed to fetch categories", 500);
    }
}
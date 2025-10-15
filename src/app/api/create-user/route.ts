import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ErrorResponse } from "@/services/errorResponse";
import { SuccessResponse } from "@/services/succesResponse";

export async function POST() {

    try {
        const user = await currentUser();
    
        if(!user) return ErrorResponse("User Not Authenticated", 401);
    
        const existingUser = await prisma.user.findUnique({
            where: {id: user.id}
        })
    
        if(!existingUser){
            await prisma.user.create({
                data:{
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    username: user?.username
                }
            })
        }
    
        return SuccessResponse("User synced successfully", 200);
    } catch (error) {
        console.error("Error in creating User", error);
        return ErrorResponse("Internal Server Error", 500);
    }
}

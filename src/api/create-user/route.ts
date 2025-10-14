import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

    const user = await currentUser();

    if(!user) return NextResponse.json(
        {error: "User Not Authenticated"},
        {status: 401}
    )

    const existingUser = await prisma.user.findUnique({
        where: {clerkId: user.id}
    })

    if(!existingUser){
        await prisma.user.create({
            data:{
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                phoneNo: user.primaryPhoneNumber?.phoneNumber,
                username: user.username
            }
        })
    }

    return NextResponse.json({
        success: true
    })
}

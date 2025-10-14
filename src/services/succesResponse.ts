import { NextResponse } from "next/server";

export function SuccessResponse(data: any, statusNo: number, message?: string){
    return NextResponse.json(
        {
            success: true,
            message: message || "Request Successful",
            data,
        },
        {status: statusNo}
    );
}
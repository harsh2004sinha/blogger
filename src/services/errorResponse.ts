import { NextResponse } from "next/server";

export function ErrorResponse(message: string, statusNo: number) {
    return NextResponse.json(
        { error: message },
        { status: statusNo }
    );
}
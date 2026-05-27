import errorHandler from "@/lib/errors/errorHandler"
import { NextResponse } from "next/server"

export const POST = async (req:Request) => {
    try {
        const data = await req.json()

        

        return NextResponse.json({status:201})
    } catch (error) {
        return errorHandler(error)
    }
}
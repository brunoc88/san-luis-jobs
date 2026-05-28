import errorHandler from "@/lib/errors/errorHandler"
import validateUserRequest from "@/lib/validateUserRequest"
import { userService } from "@/services/user.services"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        const data = await req.formData()

        const validation = validateUserRequest(data)

        if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: validation.status })

        await userService.createAccount(validation.data, validation.file)
        
        return NextResponse.json({ ok: true }, { status: 201 })
    } catch (error) {
        return errorHandler(error)
    }
}
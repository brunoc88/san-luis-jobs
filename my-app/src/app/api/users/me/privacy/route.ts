import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"

export const PATCH = async () => {
    try {
        const userId = await requireSession()
        await userService.changePrivacy(userId)

        return NextResponse.json({ok:true},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
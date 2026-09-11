import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ username: string }> }) => {
    try {
        const userId = await requireSession()

        const { username } = await params
        
        const user = await userService.getUserInfo(userId, username)

        return NextResponse.json({ ok: true, user }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
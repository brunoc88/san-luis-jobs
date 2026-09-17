import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { changeUsernameSchema } from "@/lib/schemas/user/change-username.schema"
import { validateRequest } from "@/lib/validateRequest"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request) => {
    try {
        const userId = await requireSession()
        const validation = await validateRequest(req, changeUsernameSchema)
        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: validation.status })
        }
        const { username } = validation.data
        await userService.changeUsername(userId, username)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
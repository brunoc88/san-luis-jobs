import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { changePasswordSchema } from "@/lib/schemas/user/change-password.schema"
import { validateRequest } from "@/lib/validateRequest"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, changePasswordSchema)
        if (!validate.ok) {
            return NextResponse.json({ error: validate.error }, { status: validate.status })
        }

        const allowedByUserId = rateLimiter(
            `change-password:user:${userId}`,
            rateLimitConfig.changePassword.user.limit,
            rateLimitConfig.changePassword.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        const password = validate.data?.password
        const currentPassword = validate.data?.currentPassword
        await userService.changePassword(userId, currentPassword, password)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
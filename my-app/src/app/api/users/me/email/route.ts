import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { changeEmailSchema } from "@/lib/schemas/user/change-email.schema"
import { validateRequest } from "@/lib/validateRequest"
import { mailService } from "@/services/mail.service"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, changeEmailSchema)
        if (!validate?.ok) {
            return NextResponse.json({ error: validate?.error }, { status: validate.status })
        }

        const allowedByUserId = rateLimiter(
            `change-email:user:${userId}`,
            rateLimitConfig.changeEmail.user.limit,
            rateLimitConfig.changeEmail.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const email = validate.data?.email

        const allowedByEmail = rateLimiter(
            `change-email:email:${email}`,
            rateLimitConfig.changeEmail.email.limit,
            rateLimitConfig.changeEmail.email.windowMs
        )

        if (!allowedByEmail) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { token } = await userService.requestChangeEmail(userId, email)

        await mailService.sendChangeEmailVerification(email, token)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}

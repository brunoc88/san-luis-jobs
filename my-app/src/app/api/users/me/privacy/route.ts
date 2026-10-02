import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"

export const PATCH = async () => {
    try {
        const userId = await requireSession()

        const allowedByUserId = rateLimiter(
            `change-privacy:user:${userId}`,
            rateLimitConfig.changePrivacy.user.limit,
            rateLimitConfig.changePrivacy.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await userService.changePrivacy(userId)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
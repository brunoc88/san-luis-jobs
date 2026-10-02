import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { userService } from "@/services/user.service"
import { NextRequest, NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ username: string }> }
) => {
    try {
        const userId = await requireSession()

        const { username } = await params

        const allowedByUserId = rateLimiter(
            `get-user-info:user:${userId}`,
            rateLimitConfig.getUserInfo.user.limit,
            rateLimitConfig.getUserInfo.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const user = await userService.getUserInfo(userId, username)

        return NextResponse.json(
            { ok: true, user },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
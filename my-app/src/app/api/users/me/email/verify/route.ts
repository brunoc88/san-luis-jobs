import { requireToken } from "@/domain/auth/requireToken"
import errorHandler from "@/lib/errors/errorHandler"
import { getClientIp } from "@/lib/rate-limit/getClientIp"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { userService } from "@/services/user.service"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    try {
        const searchParams = req.nextUrl.searchParams
        const token = searchParams.get("token")

        const validate = await requireToken(token)

        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }

        const allowedByIp = rateLimiter(
            `change-email-verify:ip:${clientIp}`,
            rateLimitConfig.changeEmailVerify.ip.limit,
            rateLimitConfig.changeEmailVerify.ip.windowMs
        )

        if (!allowedByIp) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const allowedByToken = rateLimiter(
            `change-email-verify:token:${validate.token}`,
            rateLimitConfig.changeEmailVerify.token.limit,
            rateLimitConfig.changeEmailVerify.token.windowMs
        )

        if (!allowedByToken) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await userService.changeEmailConfirm(validate.token)

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
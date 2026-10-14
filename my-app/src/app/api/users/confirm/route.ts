import errorHandler from "@/lib/errors/errorHandler"
import { requireToken } from "@/domain/auth/requireToken"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"
import { getClientIp } from "@/lib/rate-limit/getClientIp"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"

export const GET = async (req: Request) => {
    try {
        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }

        const allowed = rateLimiter(
            clientIp,
            rateLimitConfig.confirmAccount.ip.limit,
            rateLimitConfig.confirmAccount.ip.windowMs
        )

        if (!allowed) {
            return NextResponse.json(
                { error: "Demasiados intentos. Intente nuevamente más tarde." },
                { status: 429 }
            )
        }
        const { searchParams } = new URL(req.url)

        const token = searchParams.get("token")

        const verificationToken = await requireToken(token)

        await userService.confirmAccount(verificationToken.userId, verificationToken.token)

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )

    } catch (error) {
        return errorHandler(error)
    }
}
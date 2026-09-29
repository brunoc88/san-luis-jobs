import errorHandler from "@/lib/errors/errorHandler"
import { requireToken } from "@/domain/auth/requireToken"
import { newPasswordSchema } from "@/lib/schemas/auth/password.recovery.schema"
import { validateRequest } from "@/lib/validateRequest"
import { authService } from "@/services/auth.service"
import { mailService } from "@/services/mail.service"
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

        const allowedByIp = rateLimiter(
            `reset-password:ip:${clientIp}`,
            rateLimitConfig.resetPassword.ipGET.limit,
            rateLimitConfig.resetPassword.ipGET.windowMs
        )
        if (!allowedByIp) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        const { searchParams } = new URL(req.url)

        const token = searchParams.get("token")

        await requireToken(token)

        return NextResponse.json(
            { ok: true, valid: true },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}

export const POST = async (req: Request) => {
    try {
        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }

        const validation = await validateRequest(req, newPasswordSchema)
        if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: validation.status })

        const allowedByIp = rateLimiter(
            `reset-password:ip:${clientIp}`,
            rateLimitConfig.resetPassword.ipPOST.limit,
            rateLimitConfig.resetPassword.ipPOST.windowMs
        )
        if (!allowedByIp) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        
        const token = validation.data?.token

        const allowedByToken = rateLimiter(
            `reset-password:token:${token}`,
            rateLimitConfig.resetPassword.token.limit,
            rateLimitConfig.resetPassword.token.windowMs
        )
        if (!allowedByToken) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const res = await authService.resetPassword(validation.data)

        await mailService.sendPasswordChangedEmail(res.email)

        return NextResponse.json({ ok: true }, { status: 200 })

    } catch (error) {
        return errorHandler(error)
    }
}
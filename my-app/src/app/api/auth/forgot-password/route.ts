import errorHandler from "@/lib/errors/errorHandler"
import { passwordRecoverySchema } from "@/lib/schemas/auth/password.recovery.schema"
import { validateRequest } from "@/lib/validateRequest"
import { authService } from "@/services/auth.service"
import { mailService } from "@/services/mail.service"
import { NextResponse } from "next/server"
import { getClientIp } from "@/lib/rate-limit/getClientIp"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"

export const POST = async (req: Request) => {
    try {
        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }

        const validation = await validateRequest(req, passwordRecoverySchema)

        if (!validation.ok) {
            return NextResponse.json(
                { error: validation.error },
                { status: validation.status }
            )
        }

        const email = validation.data.email

        const allowedByIp = rateLimiter(
            `password-recovery:ip:${clientIp}`,
            rateLimitConfig.passwordRecovery.ip.limit,
            rateLimitConfig.passwordRecovery.ip.windowMs
        )

        if (!allowedByIp) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const allowedByEmail = rateLimiter(
            `password-recovery:email:${email}`,
            rateLimitConfig.passwordRecovery.email.limit,
            rateLimitConfig.passwordRecovery.email.windowMs
        )

        if (!allowedByEmail) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const res = await authService.requestPasswordRecovery(email)

        if (!res) {
            return NextResponse.json({ ok: true }, { status: 200 })
        }

        switch (res.result) {
            case "ok":
                await mailService.sendEmailPasswordRecovery(
                    res.email,
                    res.token!
                )
                break

            case "inactive":
                await mailService.sendInactiveAccountEmail(res.email)
                break

            case "suspended":
                await mailService.sendSuspendedAccountEmail(res.email)
                break
        }

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
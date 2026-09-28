import errorHandler from "@/lib/errors/errorHandler"
import { passwordRecoverySchema } from "@/lib/schemas/auth/password.recovery.schema"
import { validateRequest } from "@/lib/validateRequest"
import { authService } from "@/services/auth.service"
import { mailService } from "@/services/mail.service"
import { NextResponse } from "next/server"
import { getClientIp } from "@/lib/rate-limit/getClientIp"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"

const PASSWOR_RECOVERY_RATE_LIMIT = 5
const PASSWOR_RECOVERY_RATE_WINDOW = 60_000
const PASSWORD_RECOVERY_EMAIL_RATE_LIMIT = 3
const PASSWORD_RECOVERY_EMAIL_RATE_WINDOW = 15 * 60_000

export const POST = async (req: Request) => {
    try {
        const validation = await validateRequest(req, passwordRecoverySchema)

        if (!validation.ok) {
            return NextResponse.json(
                { error: validation.error },
                { status: validation.status }
            )
        }

        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }

        const allowed = rateLimiter(clientIp, PASSWOR_RECOVERY_RATE_LIMIT, PASSWOR_RECOVERY_RATE_WINDOW)

        if (!allowed) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const res = await authService.requestPasswordRecovery(
            validation.data?.email
        )

        if (!res) {
            return NextResponse.json({ ok: true }, { status: 200 })
        }

        switch (res.result) {
            case 'ok':
                await mailService.sendEmailPasswordRecovery(
                    res.email,
                    res.token!
                )
                break

            case 'inactive':
                await mailService.sendInactiveAccountEmail(res.email)
                break

            case 'suspended':
                await mailService.sendSuspendedAccountEmail(res.email)
                break
        }

        return NextResponse.json({ ok: true }, { status: 200 })

    } catch (error) {
        return errorHandler(error)
    }
}
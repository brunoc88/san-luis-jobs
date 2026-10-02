import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { adminService } from "@/services/admin.service"
import { mailService } from "@/services/mail.service"
import { NextResponse } from "next/server"

export const PATCH = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const suspendedUserId = parseId(id)

        const allowedByUserId = rateLimiter(
            `activate-suspended-account:user:${userId}`,
            rateLimitConfig.activateSuspendedAccount.user.limit,
            rateLimitConfig.activateSuspendedAccount.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { email } = await adminService.activateSuspendedAccount(userId, suspendedUserId)

        const allowedByEmail = rateLimiter(
            `activate-suspended-account:email:${email}`,
            rateLimitConfig.activateSuspendedAccount.email.limit,
            rateLimitConfig.activateSuspendedAccount.email.windowMs
        )

        if (!allowedByEmail) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await mailService.sendSuspendedAccountActivatedEmail(email)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
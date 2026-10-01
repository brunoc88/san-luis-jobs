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
        const inactiveUserId = parseId(id)

        const allowedByUserId = rateLimiter(
            `activate-user:user:${userId}`,
            rateLimitConfig.activateUser.user.limit,
            rateLimitConfig.activateUser.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { email } = await adminService.activateUserAccount(userId, inactiveUserId)
        await mailService.sendAccountActivatedEmail(email)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
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
        const selectedUserId = parseId(id)

        const allowedByUserId = rateLimiter(
            `toggle-user-role:user:${userId}`,
            rateLimitConfig.toggleUserRole.user.limit,
            rateLimitConfig.toggleUserRole.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { email, result } = await adminService.toggleRole(userId, selectedUserId)
        if (result === 'granted') await mailService.sendAdminRoleGrantedEmail(email)
        else await mailService.sendAdminRoleRevokedEmail(email)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { adminService } from "@/services/admin.service"
import { NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const suspendedUserId = parseId(id)

        const allowedByUserId = rateLimiter(
            `get-user-audit:user:${userId}`,
            rateLimitConfig.getUserAudit.user.limit,
            rateLimitConfig.getUserAudit.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const audit = await adminService.getUserAuditById(userId, suspendedUserId)

        return NextResponse.json({ ok: true, audit }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
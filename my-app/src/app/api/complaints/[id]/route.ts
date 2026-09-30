import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { complaintService } from "@/services/complaint.service"
import { NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const complaintId = parseId(id)

        const allowedByUserId = rateLimiter(
            `get-complaint:user:${userId}`,
            rateLimitConfig.getComplaint.user.limit,
            rateLimitConfig.getComplaint.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const complaint = await complaintService.getComplaintById(complaintId, userId)

        return NextResponse.json({ ok: true, complaint }, { status: 200 })

    } catch (error) {
        return errorHandler(error)
    }
}

export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const complaintId = parseId(id)

        const allowedByUserId = rateLimiter(
            `delete-complaint:user:${userId}`,
            rateLimitConfig.deleteComplaint.user.limit,
            rateLimitConfig.deleteComplaint.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await complaintService.deleteComplaintById(complaintId, userId)

        return NextResponse.json({ ok: true }, { status: 200 })

    } catch (error) {
        return errorHandler(error)
    }
}
import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { feedbackService } from "@/services/feedback.service"
import { NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        let { id } = await params
        let feedbackId = parseId(id)

        const allowedByUserId = rateLimiter(
            `get-feedback:user:${userId}`,
            rateLimitConfig.getFeedback.user.limit,
            rateLimitConfig.getFeedback.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const feedback = await feedbackService.getFeedbackDetailsById(feedbackId, userId)
        return NextResponse.json({ ok: true, feedback }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}

export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const feedbackId = parseId(id)

        const allowedByUserId = rateLimiter(
            `delete-feedback:user:${userId}`,
            rateLimitConfig.deleteFeedback.user.limit,
            rateLimitConfig.deleteFeedback.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }


        await feedbackService.deleteById(feedbackId, userId)
        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
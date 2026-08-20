import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { feedbackService } from "@/services/feedback.service"
import { NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        let { id } = await params
        let feedbackId = parseId(id)

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

        await feedbackService.deleteById(feedbackId, userId)
        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
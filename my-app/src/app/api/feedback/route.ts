import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { FeedBackRegisterSchema } from "@/lib/schemas/feedback/feedback.register.schema"
import { validateRequest } from "@/lib/validateRequest"
import { feedbackService } from "@/services/feedback.service"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, FeedBackRegisterSchema)
        if(!validate.ok) {
            return NextResponse.json({error: validate.error}, {status:validate.status})
        }

        await feedbackService.create(validate.data, userId)

        return NextResponse.json({ok:true},{status:201})

    } catch (error) {
        return errorHandler(error)
    }
}

export const GET = async () => {
    try {
        const userId = await requireSession()

        const feedbacks = await feedbackService.getAllFeedbacks(userId)
        return NextResponse.json({ok:true, feedbacks},{status:200})

    } catch (error) {
        return errorHandler(error)
    }
}
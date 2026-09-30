import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { FeedBackRegisterSchema } from "@/lib/schemas/feedback/feedback.register.schema"
import { PageSchema } from "@/lib/schemas/page.Schema"
import { validateRequest } from "@/lib/validateRequest"
import { feedbackService } from "@/services/feedback.service"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, FeedBackRegisterSchema)
        if (!validate.ok) {
            return NextResponse.json({ error: validate.error }, { status: validate.status })
        }

        const allowedByUserId = rateLimiter(
            `create-feedback:user:${userId}`,
            rateLimitConfig.createFeedback.user.limit,
            rateLimitConfig.createFeedback.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await feedbackService.create(validate.data, userId)

        return NextResponse.json({ ok: true }, { status: 201 })

    } catch (error) {
        return errorHandler(error)
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const userId = await requireSession()

        const searchParams = req.nextUrl.searchParams

        const validation = PageSchema.safeParse({
            page: searchParams.get("page") ?? undefined
        })

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.flatten().fieldErrors, },
                { status: 400 }
            )
        }

        const page = validation.data.page

        const allowedByUserId = rateLimiter(
            `list-feedback:user:${userId}`,
            rateLimitConfig.getAllFeedbacks.user.limit,
            rateLimitConfig.getAllFeedbacks.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { feedbacks, hasNextPage } =
            await feedbackService.getAllFeedbacks(userId, page)

        return NextResponse.json(
            {
                ok: true,
                feedbacks,
                hasNextPage
            },
            { status: 200 }
        )

    } catch (error) {
        return errorHandler(error)
    }
}
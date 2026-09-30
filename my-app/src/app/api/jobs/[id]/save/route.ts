import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { jobService } from "@/services/job.service"
import { NextResponse } from "next/server"

export const POST = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        let { id } = await params
        let jobId = parseId(id)

        const allowedByUserId = rateLimiter(
            `save-job:user:${userId}`,
            rateLimitConfig.saveJob.user.limit,
            rateLimitConfig.saveJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await jobService.saveJob(userId, jobId)

        return NextResponse.json({ ok: true }, { status: 201 })

    } catch (error) {
        return errorHandler(error)
    }
}

export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        let { id } = await params
        let jobId = parseId(id)

        const allowedByUserId = rateLimiter(
            `unsave-job:user:${userId}`,
            rateLimitConfig.unsaveJob.user.limit,
            rateLimitConfig.unsaveJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await jobService.unsaveJob(userId, jobId)
        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
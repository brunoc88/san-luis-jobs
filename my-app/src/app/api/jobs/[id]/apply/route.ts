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
        const { id } = await params
        const jobId = parseId(id)

        const allowedByUserId = rateLimiter(
            `apply-job:user:${userId}`,
            rateLimitConfig.applyJob.user.limit,
            rateLimitConfig.applyJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        await jobService.applyJob(userId, jobId)

        return NextResponse.json({ ok: true }, { status: 201 })
    } catch (error) {
        return errorHandler(error)
    }
}
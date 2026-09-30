import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { ChangesJobSchema } from "@/lib/schemas/job/job.statusChange.schema"
import { validateRequest } from "@/lib/validateRequest"
import { jobService } from "@/services/job.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const jobId = parseId(id)

        const validate = await validateRequest(req, ChangesJobSchema)
        if (!validate.ok) return NextResponse.json({ error: validate.error }, { status: 400 })

        const allowedByUserId = rateLimiter(
            `change-job-status:user:${userId}`,
            rateLimitConfig.changeJobStatus.user.limit,
            rateLimitConfig.changeJobStatus.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await jobService.changeJobStatus(userId, jobId, validate?.data?.state)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
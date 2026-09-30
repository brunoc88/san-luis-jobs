import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { ComplaintRegisterSchema } from "@/lib/schemas/complaint/complaint.create.schema"
import { validateRequest } from "@/lib/validateRequest"
import { jobService } from "@/services/job.service"
import { NextResponse } from "next/server"

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()
        const { id } = await params
        const jobId = parseId(id)

        const validate = await validateRequest(req, ComplaintRegisterSchema)
        if (!validate.ok) return NextResponse.json({ error: validate.error }, { status: 400 })

        const allowedByUserId = rateLimiter(
            `report-job:user:${userId}`,
            rateLimitConfig.reportJob.user.limit,
            rateLimitConfig.reportJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        
        await jobService.reportJob(userId, jobId, validate.data)
        return NextResponse.json({ ok: true }, { status: 201 })

    } catch (error) {
        return errorHandler(error)
    }
}
import getOptionalSessionUser from "@/domain/auth/optionalSessionUser"
import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { validateRequest } from "@/lib/validateRequest"
import { jobService } from "@/services/job.service"
import { NextResponse } from "next/server"

export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        let { id } = await params
        let jobId = parseId(id)

        const allowedByUserId = rateLimiter(
            `delete-job:user:${userId}`,
            rateLimitConfig.deleteJob.user.limit,
            rateLimitConfig.deleteJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await jobService.deleteJob(userId, jobId)

        return NextResponse.json({ ok: true }, { status: 200 })

    } catch (error) {
        return errorHandler(error)
    }
}

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const user = await getOptionalSessionUser()

        let { id } = await params
        let jobId = parseId(id)

        const job = await jobService.getJobDetailsById(jobId, user?.id,)

        return NextResponse.json({ ok: true, job }, { status: 200 })

    } catch (error) {
        return errorHandler(error)
    }
}

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()
        let { id } = await params
        let jobId = parseId(id)

        const validate = await validateRequest(req, JobRegisterSchema)
        if (!validate.ok) {
            return NextResponse.json({ error: validate.error }, { status: validate.status })
        }

        const allowedByUserId = rateLimiter(
            `edit-job:user:${userId}`,
            rateLimitConfig.editJob.user.limit,
            rateLimitConfig.editJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await jobService.editJob(userId, jobId, validate?.data)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
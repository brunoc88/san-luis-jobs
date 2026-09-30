import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { getClientIp } from "@/lib/rate-limit/getClientIp"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { validateQueryParams } from "@/lib/validateQueryParams"
import { validateRequest } from "@/lib/validateRequest"
import { jobService } from "@/services/job.service"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, JobRegisterSchema)
        if (!validate.ok) return NextResponse.json({ error: validate.error }, { status: 400 })

        const allowedByUserId = rateLimiter(
            `create-job:user:${userId}`,
            rateLimitConfig.createJob.user.limit,
            rateLimitConfig.createJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const jobId = await jobService.create(userId, validate.data)

        return NextResponse.json({ ok: true, jobId }, { status: 201 })
    } catch (error) {
        return errorHandler(error)
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }
        const searchParams = req.nextUrl.searchParams

        const validate = validateQueryParams(searchParams)
        if (!validate.ok) {
            return NextResponse.json({ error: validate.error }, { status: validate.status })
        }

        const allowedByIp = rateLimiter(
            `list-jobs:ip:${clientIp}`,
            rateLimitConfig.listJobs.ip.limit,
            rateLimitConfig.listJobs.ip.windowMs
        )

        if (!allowedByIp) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const res = await jobService.getJobs(validate?.data)

        return NextResponse.json({ ok: true, jobs: res.jobs, pagination: res.pagination }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
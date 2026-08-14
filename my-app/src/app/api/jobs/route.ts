import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { validateQueryParams } from "@/lib/validateQueryParams"
import { jobService } from "@/services/job.service"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, JobRegisterSchema)
        if (!validate.ok) return NextResponse.json({ error: validate.error }, { status: 400 })

        const jobId = await jobService.create(userId, validate.data)

        return NextResponse.json({ ok: true, jobId }, { status: 201 })
    } catch (error) {
        return errorHandler(error)
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const searchParams = req.nextUrl.searchParams

        const validate = validateQueryParams(searchParams)
        if(!validate.ok) {
            return NextResponse.json({error:validate.error}, {status:validate.status})
        }
        const res = await jobService.getJobs(validate?.data)

        return NextResponse.json({ ok: true, jobs: res.jobs, pagination: res.pagination }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
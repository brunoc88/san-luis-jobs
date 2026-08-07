import getOptionalSessionUser from "@/domain/auth/optionalSessionUser"
import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { jobService } from "@/services/job.service"
import { NextResponse } from "next/server"

export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        let {id} = await params
        let jobId = parseId(id)

        await jobService.deleteJob(userId, jobId)

        return NextResponse.json({ok:true},{status:200})

    } catch (error) {
        return errorHandler(error)
    }
}

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const user = await getOptionalSessionUser()
         
        let {id} = await params
        let jobId = parseId(id)

        const job = await jobService.getJobDetailsById( jobId, user?.id,)

        return NextResponse.json({ok:true, job},{status:200})

    } catch (error) {
        return errorHandler(error)
    }
}
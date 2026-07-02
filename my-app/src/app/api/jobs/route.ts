import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { validateRequest } from "@/lib/validateRequest"
import { jobService } from "@/services/job.service"
import { NextResponse } from "next/server"

export const POST = async (req:Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, JobRegisterSchema)
        if(!validate.ok) return NextResponse.json({error: validate.error}, {status:400})

        const jobId = await jobService.create(userId, validate.data)
        
        return NextResponse.json({ok:true, jobId},{status:201})
    } catch (error) {
        return errorHandler(error)
    }
}
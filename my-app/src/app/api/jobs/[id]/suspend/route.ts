import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { SuspensionReasonSchema } from "@/lib/schemas/warning/warnigSchema"
import { validateRequest } from "@/lib/validateRequest"
import { jobService } from "@/services/job.service"
import { NextResponse } from "next/server"

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const jobId = parseId(id)

        
        const validate = await validateRequest(req, SuspensionReasonSchema)
        if(!validate.ok) return NextResponse.json({error: validate.error},{status:validate.status})
        
        await jobService.suspendJob(userId, jobId, validate.data)

        return NextResponse.json({ok:true},{status:201})

    } catch (error) {
        return errorHandler(error)
    }
}
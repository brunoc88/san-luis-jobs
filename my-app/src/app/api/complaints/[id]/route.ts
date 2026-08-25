import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { complaintService } from "@/services/complaint.service"
import { NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const complaintId = parseId(id)

        const complaint = await complaintService.getComplaintById(complaintId, userId)

        return NextResponse.json({ok:true, complaint},{status:200})

    } catch (error) {
        return errorHandler(error)
    }
}

export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const complaintId = parseId(id)

        await complaintService.deleteComplaintById(complaintId, userId)
        
        return NextResponse.json({ok:true},{status:200})

    } catch (error) {
        return errorHandler(error)
    }
}
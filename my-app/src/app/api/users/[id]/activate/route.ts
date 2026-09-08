import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { adminService } from "@/services/admin.service"
import { mailService } from "@/services/mail.service"
import { NextResponse } from "next/server"

export const PATCH = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const inactiveUserId = parseId(id)

        const {email} = await adminService.activateUserAccount(userId, inactiveUserId)
        await mailService.sendAccountActivatedEmail(email)

        return NextResponse.json({ok:true},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
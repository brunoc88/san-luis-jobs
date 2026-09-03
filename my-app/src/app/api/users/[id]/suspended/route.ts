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
        const suspendedUserId = parseId(id)

        const { email } = await adminService.activateSuspendedAccount(userId, suspendedUserId)
        await mailService.sendSuspendedAccountActivatedEmail(email)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
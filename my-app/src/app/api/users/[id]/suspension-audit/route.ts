import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { adminService } from "@/services/admin.service"
import { NextResponse } from "next/server"

export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const suspendedUserId = parseId(id)

        const audit = await adminService.getUserAuditById(userId, suspendedUserId)

        return NextResponse.json({ ok: true, audit }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
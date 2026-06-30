import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params

        const locationId = Number(id)

        const location = await locationService.toggleLocationStatus(userId, locationId)

        return NextResponse.json({ok:true, location},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
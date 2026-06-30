import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import locationInputSchema from "@/lib/schemas/location/location.schema"
import { validateRequest } from "@/lib/validateRequest"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params

        const locationId = Number(id)

        const validate = await validateRequest(req, locationInputSchema)
        if (!validate.ok) return NextResponse.json({ error: validate.error }, { status: validate.status })

        const location = await locationService.renameLocation(userId, locationId, validate.data?.name)

        return NextResponse.json({ok:true, location}, {status:200})

    } catch (error) {
        return errorHandler(error)
    }
}
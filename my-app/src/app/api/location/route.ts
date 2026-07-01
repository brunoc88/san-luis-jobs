import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import locationInputSchema from "@/lib/schemas/location/location.schema"
import { validateRequest } from "@/lib/validateRequest"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        
        const userId = await requireSession()
        
        const validate = await validateRequest(req, locationInputSchema)
        if (!validate.ok) return NextResponse.json({ error: validate.error }, { status: validate.status })
        
        const location = await locationService.createLocation(userId, validate.data?.name)
        
        return NextResponse.json({ok:true, location},{status:201})
        
    } catch (error) {
        return errorHandler(error)
    }
}

export const GET = async () => {
    try {
        const userId = await requireSession()

        const locations = await locationService.getAllLocations(userId)

        return NextResponse.json({ok:true, locations},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
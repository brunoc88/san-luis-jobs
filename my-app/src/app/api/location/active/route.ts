import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        const userId = await requireSession()

        const locations = await locationService.getAllActiveLocations(userId)

        return NextResponse.json({ok:true, locations},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
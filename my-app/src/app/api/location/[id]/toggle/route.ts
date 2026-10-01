import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params

        const locationId = parseId(id)

         const allowedByUserId = rateLimiter(
            `toggle-location-status:user:${userId}`,
            rateLimitConfig.toggleLocationStatus.user.limit,
            rateLimitConfig.toggleLocationStatus.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        
        const location = await locationService.toggleLocationStatus(userId, locationId)

        return NextResponse.json({ok:true, location},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        const userId = await requireSession()

        const allowedByUserId = rateLimiter(
            `list-active-locations:user:${userId}`,
            rateLimitConfig.getAllActiveLocations.user.limit,
            rateLimitConfig.getAllActiveLocations.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const locations = await locationService.getAllActiveLocations(userId)

        return NextResponse.json({ ok: true, locations }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
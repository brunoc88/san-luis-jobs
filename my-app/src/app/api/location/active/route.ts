import errorHandler from "@/lib/errors/errorHandler"
import { getClientIp } from "@/lib/rate-limit/getClientIp"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const GET = async (req: Request) => {
    try {
       const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }
        const allowedByIp = rateLimiter(
            `list-jobs:ip:${clientIp}`,
            rateLimitConfig.getAllActiveLocations.ip.limit,
            rateLimitConfig.getAllActiveLocations.ip.windowMs
        )

        if (!allowedByIp) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        const locations = await locationService.getAllActiveLocations()

        return NextResponse.json({ ok: true, locations }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
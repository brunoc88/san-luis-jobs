import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { parseId } from "@/lib/parseId"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import locationInputSchema from "@/lib/schemas/location/location.schema"
import { validateRequest } from "@/lib/validateRequest"
import { locationService } from "@/services/location.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params

        const locationId = parseId(id)

        const validate = await validateRequest(req, locationInputSchema)
        if (!validate.ok) return NextResponse.json({ error: validate.error }, { status: validate.status })

        const allowedByUserId = rateLimiter(
            `rename-location:user:${userId}`,
            rateLimitConfig.renameLocation.user.limit,
            rateLimitConfig.renameLocation.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const location = await locationService.renameLocation(userId, locationId, validate.data?.name)

        return NextResponse.json({ ok: true, location }, { status: 200 })

    } catch (error) {
        return errorHandler(error)
    }
}
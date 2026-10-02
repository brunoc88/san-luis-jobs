import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { PaginationSchema } from "@/lib/schemas/page.Schema"
import { userService } from "@/services/user.service"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) => {
    try {
        const userId = await requireSession()

        const searchParams = req.nextUrl.searchParams

        const validate = PaginationSchema.safeParse({
            page: searchParams.get('page') ?? undefined,
            search: searchParams.get('search') ?? undefined,
            sort: searchParams.get('sort') ?? undefined
        })

        if (!validate.success) {
            return NextResponse.json(
                { error: validate.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const allowedByUserId = rateLimiter(
            `get-user-saved-jobs:user:${userId}`,
            rateLimitConfig.getUserSavedJobs.user.limit,
            rateLimitConfig.getUserSavedJobs.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }
        
        const { username } = await params

        const { page, search, sort } = validate.data

        const savedJobsInfo = await userService.getUserSavedJobs(
            userId,
            username,
            page,
            search,
            sort
        )

        return NextResponse.json(
            { ok: true, savedJobsInfo },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
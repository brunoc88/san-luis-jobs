import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { UserAccountSearchSchema } from "@/lib/schemas/admin/user.account.search.schema"
import { adminService } from "@/services/admin.service"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    try {
        const userId = await requireSession()

        const searchParams = req.nextUrl.searchParams

        const validation = UserAccountSearchSchema.safeParse({
            page: searchParams.get("page") ?? undefined,
            search: searchParams.get("search") ?? undefined
        })

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const page = validation.data.page
        const search = validation.data.search

        const allowedByUserId = rateLimiter(
            `list-suspended-users:user:${userId}`,
            rateLimitConfig.listSuspendedUsers.user.limit,
            rateLimitConfig.listSuspendedUsers.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }


        const { accounts, hasNextPage } = await adminService.getAllSuspendedAccounts(userId, page, search)

        return NextResponse.json({ ok: true, accounts, hasNextPage }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
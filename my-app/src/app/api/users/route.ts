import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { getClientIp } from "@/lib/rate-limit/getClientIp"
import { rateLimitConfig } from "@/lib/rate-limit/rateLimitConfig"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"
import { UserAccountSearchSchema } from "@/lib/schemas/admin/user.account.search.schema"
import validateUserRequest from "@/lib/validateUserRequest"
import { adminService } from "@/services/admin.service"
import { mailService } from "@/services/mail.service"
import { userService } from "@/services/user.service"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {

        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }

        const allowed = rateLimiter(
            clientIp,
            rateLimitConfig.createUser.ip.limit,
            rateLimitConfig.createUser.ip.windowMs
        )

        if (!allowed) {
            return NextResponse.json(
                { error: "Demasiados intentos. Intente nuevamente más tarde." },
                { status: 429 }
            )
        }

        const data = await req.formData()
        
        const validation = validateUserRequest(data)

        if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: validation.status })

        const user = await userService.createAccount(validation.data, validation.file, validation.cvFile)

        await mailService.sendEmailVerification(user.email, user.token)

        return NextResponse.json({ ok: true }, { status: 201 })
    } catch (error) {
        return errorHandler(error)
    }
}

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
            `list-users:user:${userId}`,
            rateLimitConfig.listUsers.user.limit,
            rateLimitConfig.listUsers.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { accounts, hasNextPage } = await adminService.getAllAccounts(userId, page, search)

        return NextResponse.json({ ok: true, accounts, hasNextPage }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
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
                { error: validate.error },
                { status: 400 }
            )
        }

        const { username } = await params

        const { page, search, sort } = validate.data

        const userJobsInfo = await userService.getUserJobs(
            userId,
            username,
            page,
            search,
            sort
        )

        return NextResponse.json(
            { ok: true, userJobsInfo },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
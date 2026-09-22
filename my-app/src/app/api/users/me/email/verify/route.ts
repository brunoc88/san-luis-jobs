import { requireToken } from "@/domain/auth/requireToken"
import errorHandler from "@/lib/errors/errorHandler"
import { userService } from "@/services/user.service"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    try {
        const searchParams = req.nextUrl.searchParams

        const token = searchParams.get("token")

        const validate = await requireToken(token)

        await userService.changeEmailConfirm(validate.token)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
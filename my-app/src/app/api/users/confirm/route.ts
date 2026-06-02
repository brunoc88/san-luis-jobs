import errorHandler from "@/lib/errors/errorHandler"
import { requireToken } from "@/lib/requireToken"
import { userService } from "@/services/user.services"
import { NextResponse } from "next/server"

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url)

        const token = searchParams.get("token")

        const verificationToken = await requireToken(token)

        await userService.confirmAccount(verificationToken.userId, verificationToken.token)

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )

    } catch (error) {
        return errorHandler(error)
    }
}
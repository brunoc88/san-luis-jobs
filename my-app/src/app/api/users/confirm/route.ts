import errorHandler from "@/lib/errors/errorHandler"
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import { NextResponse } from "next/server"

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url)

        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json(
                { error: "Token requerido" },
                { status: 400 }
            )
        }

        const verificationToken =
            await verificationTokenRepo.findByToken(token)

        if (!verificationToken) {
            return NextResponse.json(
                { error: "Token inválido" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )

    } catch (error) {
        return errorHandler(error)
    }
}
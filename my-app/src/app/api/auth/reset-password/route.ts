import errorHandler from "@/lib/errors/errorHandler"
import { requireToken } from "@/lib/requireToken"
import { newPasswordSchema } from "@/lib/schemas/auth/password.recovery.schema"
import { validateRequest } from "@/lib/validateRequest"
import { authService } from "@/services/auth.service"
import { mailService } from "@/services/mail.service"
import { NextResponse } from "next/server"

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url)

        const token = searchParams.get("token")

        await requireToken(token)

        return NextResponse.json(
            { ok: true, valid:true },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}

export const POST = async (req: Request) => {
    try {
        const validation = await validateRequest(req, newPasswordSchema)
        if(!validation.ok) return NextResponse.json({error: validation.error},{status:validation.status})
        
        const res = await authService.resetPassword(validation.data)
        
        await mailService.sendPasswordChangedEmail(res.email)

        return NextResponse.json({ok:true},{status:200})

    } catch (error) {
        return errorHandler(error)
    }
}
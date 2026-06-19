import errorHandler from "@/lib/errors/errorHandler"
import { passwordRecoverySchema } from "@/lib/schemas/auth/password.recovery.schema"
import { validateRequest } from "@/lib/validateRequest"
import { authService } from "@/services/auth.service"
import { mailService } from "@/services/mail.service"
import { NextResponse } from "next/server"

export const POST = async (req:Request) => {
    try {
        const validation = await validateRequest(req, passwordRecoverySchema)
        if(!validation.ok) return NextResponse.json({error: validation.error},{status:validation.status})
        
        const res = await authService.requestPasswordRecovery(validation.data?.email)

        if(res) await mailService.sendEmailPasswordRecovery(res.email, res.token)

        return NextResponse.json({ok:true},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
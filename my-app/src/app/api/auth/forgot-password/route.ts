import errorHandler from "@/lib/errors/errorHandler"
import { authService } from "@/services/auth.service"
import { mailService } from "@/services/mail.service"
import { NextResponse } from "next/server"

export const POST = async (req:Request) => {
    try {
        const data = await req.json()

        // validacion de datos y respuesta


        // si pasa la validacion llamo a auth service
        const res = await authService.requestPasswordRecovery(data)


        // si pasa auth servcice mando el token por email
        if(res) await mailService.sendEmailPasswordRecovery(res.email, res.token)

        return NextResponse.json({ok:true},{status:200})
    } catch (error) {
        return errorHandler(error)
    }
}
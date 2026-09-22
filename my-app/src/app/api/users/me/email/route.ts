import requireSession from "@/domain/auth/requireSession"
import { requireToken } from "@/domain/auth/requireToken"
import errorHandler from "@/lib/errors/errorHandler"
import { changeEmailSchema } from "@/lib/schemas/user/change-email.schema"
import { validateRequest } from "@/lib/validateRequest"
import { mailService } from "@/services/mail.service"
import { userService } from "@/services/user.service"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(req, changeEmailSchema)
        if (!validate?.ok) {
            return NextResponse.json({ error: validate?.error }, { status: validate.status })
        }

        const email = validate.data?.email

        const { token } = await userService.requestChangeEmail(userId, email)
        
        await mailService.sendChangeEmailVerification(email, token)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}

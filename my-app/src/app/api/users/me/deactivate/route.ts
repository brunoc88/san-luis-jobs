import requireSession from "@/domain/auth/requireSession"
import errorHandler from "@/lib/errors/errorHandler"
import { deactivateAccountSchema } from "@/lib/schemas/user/deactivate-account.schema"
import { validateRequest } from "@/lib/validateRequest"
import { userService } from "@/services/user.service"
import { NextRequest, NextResponse } from "next/server"

export const PATCH = async (req:NextRequest) => {
    try {
        const userId = await requireSession()


        const validate = await validateRequest(req, deactivateAccountSchema)
        if(!validate?.ok){
            return NextResponse.json({error: validate?.error},{status:validate.status})
        }

        const password = validate.data.password
        await userService.deactivateMyAccount(userId, password)
        return NextResponse.json({ok:true},{status:200})

    } catch (error) {
        return errorHandler(error)
    }
}
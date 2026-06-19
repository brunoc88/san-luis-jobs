import { BadRequestError, NotFoundError } from "@/lib/errors/appError"
import { generateToken } from "@/lib/generateToken"
import { requireToken } from "@/lib/requireToken"
import { userRepo } from "@/repositories/user.repository"
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import bcrypt from "bcryptjs"

export const authService = {
    requestPasswordRecovery: async (email: string) : Promise <{token:string, email:string}|void> => {
        const user = await userRepo.findByEmail(email)

        if (!user) return
        if (!user.isActive) return

        
        const existingToken = await verificationTokenRepo.findTokenByUserId(user.id)
        if (existingToken) return


        const {token, tokenHash, expiresAt} = generateToken()

        const newToken = {token:tokenHash, userId: user.id, expiresAt}

        await verificationTokenRepo.create(newToken)

        return {token, email:user.email}
    },

    resetPassword: async (data: {password:string, token:string}) : Promise<{email:string}> => {
       
        const token = await requireToken(data.token)
        
        
        let user = await userRepo.findById(token.userId)
        if(!user) throw new NotFoundError()
        if(!user.isActive) throw new BadRequestError('cuenta inactiva')


        let hashedPassword = await bcrypt.hash(data.password, 10)
        await userRepo.updatePassword(hashedPassword, user.id)

        
        await verificationTokenRepo.delete(token.token)

        return {email:user.email}
    }
}
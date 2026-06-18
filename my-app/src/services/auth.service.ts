import { BadRequestError, NotFoundError } from "@/lib/errors/appError"
import { generateToken } from "@/lib/generateToken"
import { requireToken } from "@/lib/requireToken"
import { userRepo } from "@/repositories/user.repository"
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import bcrypt from "bcryptjs"

export const authService = {
    requestPasswordRecovery: async (email: string) : Promise <{token:string, email:string}|void> => {
        const user = await userRepo.findByEmail(email)

        // por cuestiones de seguridad y no darle pista a los atacantes decidi no devolver mensajes
        // busco usuario o si esta activo
        if (!user) return
        if (!user.isActive) return

        // busco si ya hay un token relacionado con esa cuenta
        const existingToken = await verificationTokenRepo.findTokenByUserId(user.id)
        if (existingToken) return

        // creamos nuevo token 

        const {token, tokenHash, expiresAt} = generateToken()

        const newToken = {token:tokenHash, userId: user.id, expiresAt}

        await verificationTokenRepo.create(newToken)

        return {token, email:user.email}
    },

    resetPassword: async (data: {password:string, token:string}) : Promise<{email:string}> => {
        // busco si hay token y si esta en la db
        
        const token = await requireToken(data.token)

        // busco el usuario en la db 
        let user = await userRepo.findById(token.userId)
        if(!user) throw new NotFoundError()
        if(!user.isActive) throw new BadRequestError('cuenta inactiva')

        // actualizo password

        let hashedPassword = await bcrypt.hash(data.password, 10)
        await userRepo.updatePassword(hashedPassword, user.id)

        // elimino el token
        // token.token es el token de la db no el parametro
        await verificationTokenRepo.delete(token.token)

        return {email:user.email}
    }
}
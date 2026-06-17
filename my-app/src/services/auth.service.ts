import { generateToken } from "@/lib/generateToken"
import { userRepo } from "@/repositories/user.repository"
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"

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
    }
}
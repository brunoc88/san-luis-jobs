import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { generateToken } from "@/domain/auth/generateToken"
import { requireToken } from "@/domain/auth/requireToken"
import { userRepo } from "@/repositories/user.repository"
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import bcrypt from "bcryptjs"

export const authService = {
    requestPasswordRecovery: async (email: string): Promise<
        { token?: string, email: string, result: "ok" | "inactive" | "suspended" } | void
    > => {

        const user = await userRepo.findByEmail(email)

        if (!user) return

        if (user.isSuspended) {
            return {
                email: user.email,
                result: 'suspended'
            }
        }

        if (!user.isActive) {
            return {
                email: user.email,
                result: 'inactive'
            }
        }

        const existingToken = await verificationTokenRepo.findTokenByUserId(user.id)

        if (existingToken) {
            await verificationTokenRepo.delete(existingToken.token)
        }

        const { token, tokenHash, expiresAt } = generateToken()

        const newToken = {
            token: tokenHash,
            userId: user.id,
            expiresAt
        }

        await verificationTokenRepo.create(newToken)

        return {
            token,
            email: user.email,
            result: 'ok'
        }
    },

    resetPassword: async (data: { password: string, token: string }): Promise<{ email: string }> => {

        const token = await requireToken(data.token)


        let user = await userRepo.findById(token.userId)
        if (!user) throw new NotFoundError()
        if (user.isSuspended) {
            throw new ForbiddenError('Cuenta suspendida')
        }

        if (!user.isActive) {
            throw new BadRequestError('cuenta inactiva')
        }


        let hashedPassword = await bcrypt.hash(data.password, 10)
        await userRepo.updatePassword(hashedPassword, user.id)


        await verificationTokenRepo.delete(token.token)

        return { email: user.email }
    }
}
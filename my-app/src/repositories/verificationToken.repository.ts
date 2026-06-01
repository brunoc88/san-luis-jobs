import { prisma } from "@/lib/prisma"
import { CreateVerificationTokenData } from "@/types/user/user.token.verification.type"

export const verificationTokenRepo = {
    create: async (data: CreateVerificationTokenData) => {
        return prisma.emailVerificationToken.create({
            data
        })
    },

    findByToken: async (token:string) => {
        return prisma.emailVerificationToken.findUnique({where:token})
    }
}
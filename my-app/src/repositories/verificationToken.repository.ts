import { prisma } from "@/lib/prisma"
import { CreateVerificationTokenData } from "@/types/user/user.token.verification.type"

export const verificationTokenRepo = {
    create: async (data: CreateVerificationTokenData) => {
        return prisma.emailVerificationToken.create({
            data
        })
    },

    findByToken: async (token: string) => {
        return prisma.emailVerificationToken.findUnique({
            where: {
                token
            }
        })
    },
    
    findTokenByUserId: async (userId:number) => {
        return prisma.emailVerificationToken.findFirst({where: {userId}})
    },

    delete: async (token:string) => {
        return prisma.emailVerificationToken.delete({where:{token}})
    }
}
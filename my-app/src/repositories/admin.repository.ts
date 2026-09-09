import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const adminRepo = {
    activateSuspendedAccountById: async (id: number) => {
        await prisma.user.update({ data: { isActive: true, isSuspended: false }, where: { id } })
    },

    desactivateUserWarningsById: async (id: number) => {
        await prisma.warning.updateMany({
            data: { isActive: false },
            where: {
                userId: id,
                isActive: true
            }
        })
    },

    revokeAdminRoleById: async (id: number) => {
        await prisma.user.update({ data: { role: 'common' }, where: { id } })
    },

    assignAdminRoleById: async (id: number) => {
        await prisma.user.update({ data: { role: 'admin' }, where: { id } })
    },

    findUserAuditById: async (id: number) => {
        return await prisma.warning.findMany({
            where: { userId: id }, include: {
                user: {
                    select: {
                        username: true
                    }
                },
                job: {
                    select: {
                        title: true,
                        description: true,
                        createdAt: true
                    }
                },
                admin: {
                    select: {
                        username: true
                    }
                }
            }
        })
    },

    activateUserAccountById: async (id: number) => {
        await prisma.user.update({ data: { isActive: true }, where: { id } })
    },

    findAllSuspendedAccounts: async (where:Prisma.UserWhereInput, skip:number, take:number) => {
        return await prisma.user.findMany({
            where,
            skip,
            take
        })
    },

    findAllAccounts: async (where:Prisma.UserWhereInput, skip:number, take:number) => {
        return await prisma.user.findMany({
            where,
            skip,
            take
        })
    }
}
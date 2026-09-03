import { prisma } from "@/lib/prisma"

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
    }
}
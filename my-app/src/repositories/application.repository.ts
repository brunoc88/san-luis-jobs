import { prisma } from "@/lib/prisma"

export const applicationRepo = {
    count: async (jobId: number): Promise<number> => {
        return await prisma.application.count({ where: { jobId } })
    },

    create: async (jobId: number, userId: number) => {
        await prisma.application.create({ data: { jobId, userId } })
    },

    findByUserAndJob: async (userId: number, jobId: number) => {
        return await prisma.application.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId
                }
            }
        })
    }

}
import { prisma } from "@/lib/prisma"
import { CreateJobData, SaveJobData } from "@/types/job/job.type"
import { Job } from "@prisma/client"

export const jobRepo = {
    create: async (data: CreateJobData): Promise<Job> => {
        return await prisma.job.create({ data })
    },

    delete: async (id: number) => await prisma.job.update({ data: { isActive: false }, where: { id } }),

    suspend: async (id: number) => await prisma.job.update({ data: { isActive: false, isSuspended: true }, where: { id } }),

    suspendAllByAuthorId: async (authorId: number) => await prisma.job.updateMany({
        where: {
            userId: authorId,
        },
        data: {
            isActive: false,
            isSuspended: true,
        }
    }),

    saveJob: async (data:SaveJobData) => await prisma.savedJob.create({data})
}
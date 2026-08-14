import { prisma } from "@/lib/prisma"
import { CreateJobData, SaveJobData } from "@/types/job/job.type"
import { Job, JobState, Prisma } from "@prisma/client"

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

    saveJob: async (data: SaveJobData) => await prisma.savedJob.create({ data }),

    getSavedJob: async (userId: number, jobId: number) => await prisma.savedJob.findFirst({ where: { userId, jobId } }),

    removeSavedJob: async (userId: number, jobId: number) =>
        await prisma.savedJob.delete({
            where: {
                userId_jobId: {
                    userId,
                    jobId
                }
            }
        }),

    findJobById: async (id: number): Promise<Job | null> => await prisma.job.findUnique({ where: { id, isActive: true } }),

    finishJob: async (id: number) => await prisma.job.update({ data: { state: 'finished' }, where: { id } }),

    changeJobStatus: async (state: JobState, jobId: number) => await prisma.job.update({ data: { state }, where: { id: jobId } }),

    findJobDetailsById: async (id: number) => {
        return await prisma.job.findUnique({
            where: { id, isActive: true, isSuspended: false },
            include: {
                user: {
                    select: {
                        username: true,
                        pic: true
                    }
                },
                location: {
                    select: {
                        name: true
                    }
                }
            }
        })
    },

    findAllActiveJobs: async (
        where: Prisma.JobWhereInput,
        skip: number,
        take: number,
        orderBy: Prisma.JobOrderByWithRelationInput
    ) => {

        return await prisma.job.findMany({
            where,
            skip,
            take,
            orderBy,

            select: {
                id: true,
                title: true,
                createdAt: true,
                modality: true,
                schedule: true,

                user: {
                    select: {
                        username: true
                    }
                },

                location: {
                    select: {
                        name: true
                    }
                },

                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        })
    }

}
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { prisma } from "@/lib/prisma"

export const requireActiveJobById = async (id: number) => {
    const job = await prisma.job.findUnique({where:{id}})

    if(!job) throw new NotFoundError('job no encontrado')
    if(!job.isActive) throw new NotFoundError('job no encontrado')
    if(job.isSuspended) throw new ForbiddenError('job eliminado por violacion')

    return {
        id: job.id,
        autorId: job.userId,
        title: job.title
    }
}
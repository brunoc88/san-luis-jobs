import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireActiveJobById } from "@/domain/job/requireActiveJobById"
import { requireActiveLocationById } from "@/domain/location/requireActiveLocationById"
import { ForbiddenError } from "@/lib/errors/appError"
import { jobRepo } from "@/repositories/job.repository"
import { CreateJobDto } from "@/types/job/job.type"

export const jobService = {
    create: async (userId: number, data: CreateJobDto): Promise<number> => {
        const user = await requireActiveUserById(userId)

        await requireActiveLocationById(data.locationId)

        const { ...rest } = data
        const jobToCreate = { ...rest, userId: user.id }

        const job = await jobRepo.create(jobToCreate)
        return job.id
    },

    deleteJob: async (userId: number, jobId: number): Promise<void> => {
        const user = await requireActiveUserById(userId)
        
        const job = await requireActiveJobById(jobId)
        
        if (user.id !== job.autorId) throw new ForbiddenError('No tenés permiso para eliminar este empleo')
        
        await jobRepo.delete(jobId)

        return
    }
}
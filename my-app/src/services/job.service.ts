import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireActiveLocationById } from "@/domain/location/requireActiveLocationById"
import { jobRepo } from "@/repositories/job.repository"
import { CreateJobDto } from "@/types/job/job.type"

export const jobService = {
    create: async (userId: number, data: CreateJobDto): Promise<number > => {
        const user = await requireActiveUserById(userId)
        
        await requireActiveLocationById(data.locationId)
        
        const { ...rest } = data
        const jobToCreate = { ...rest, userId:user.id }

        const job = await jobRepo.create(jobToCreate)
        return job.id
    }
}
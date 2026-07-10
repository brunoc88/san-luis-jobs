import { prisma } from "@/lib/prisma"
import { CreateJobData } from "@/types/job/job.type"
import {Job} from "@prisma/client"

export const jobRepo = {
    create: async (data: CreateJobData) : Promise<Job>=> {
        return await prisma.job.create({data})
    },

    delete: async (id:number) => await prisma.job.update({data:{isActive:false},where:{id}}),
    
}
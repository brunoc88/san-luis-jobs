import { prisma } from "@/lib/prisma"
import { CreateComplaintData } from "@/types/complaint/complaint.types"
import { Complaint } from "@prisma/client"


export const complaintRepo = {
    create: async (data: CreateComplaintData) : Promise<void>=> {
        await prisma.complaint.create({data})
    },

    findByUserAndJob: async (userId:number, jobId:number) : Promise<Complaint | null>=> {
        return await prisma.complaint.findUnique({where:{userId_jobId:{userId, jobId}}})
    }
}
import { prisma } from "@/lib/prisma"
import { CreateComplaintData } from "@/types/complaint/complaint.types"
import { Complaint } from "@prisma/client"


export const complaintRepo = {
    create: async (data: CreateComplaintData): Promise<void> => {
        await prisma.complaint.create({ data })
    },

    findByUserAndJob: async (userId: number, jobId: number): Promise<Complaint | null> => {
        return await prisma.complaint.findUnique({ where: { userId_jobId: { userId, jobId } } })
    },

    findComplaintById: async (id: number) => {
        return prisma.complaint.findUnique({
            where: {
                id,
                isActive: true
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                },
                job: {
                    select: {
                        title: true,
                        user: {
                            select: {
                                username: true
                            }
                        }
                    }
                }
            }
        })
    },

    deleteById: async (id:number) => {
        await prisma.complaint.updateMany({data:{isActive:false}, where:{id}})
    }
}
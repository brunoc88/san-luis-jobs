import { prisma } from "@/lib/prisma"

export const feedbackRepo = {
    create: async (data: {opinion:string, userId:number}) => {
        await prisma.feedback.create({data})
    },

    findById: async (id: number ) => {
        return await prisma.feedback.findUnique({where:{id}, include:{
            user:{
                select:{
                    username:true
                }
            }
        }})
    },

    deleteById: async (id: number) : Promise<void> => {
        await prisma.feedback.delete({where:{id}})
    },

    findAllFeedbacks: async () => {
        return await prisma.feedback.findMany({include:{
            user:{
                select:{
                    username:true
                }
            }
        }
    })
    }
}
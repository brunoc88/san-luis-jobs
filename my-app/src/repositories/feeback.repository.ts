import { prisma } from "@/lib/prisma"

export const feedbackRepo = {
    create: async (data: {opinion:string, userId:number}) => {
        await prisma.feedback.create({data})
    }
}
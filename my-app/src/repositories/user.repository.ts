import { CreateUserData } from "@/types/user/user.register.type"
import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"

export const userRepo = {
    create: async (data: CreateUserData): Promise<User> => await prisma.user.create({ data }),

    findById: async(id:number) : Promise<User | null> => await prisma.user.findUnique({where:{id}}),
    
    active: async(id:number) => await prisma.user.update({data:{isActive:true},where:{id}}),

    findByEmail: async (email: string) : Promise<User | null> => await prisma.user.findUnique({where:{email}}),

    updatePassword: async (password:string, userId:number) : Promise<void> => {
        await prisma.user.update({data:{password},where:{id:userId}})
        return
    },

    suspend: async (id:number) => await prisma.user.update({data:{isActive:false, isSuspended:true},where:{id}}),
  
}
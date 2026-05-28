import { CreateUserData } from "@/types/user/user.register.type"
import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"

export const userRepo = {
    create: async (data: CreateUserData): Promise<User> => await prisma.user.create({ data })
}
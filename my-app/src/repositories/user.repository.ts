import { UserToUpload } from "@/types/user/user.register.type"
import { prisma } from "@/lib/prima"
import { User } from "@prisma/client"

export const userRepo = {
    createAccount: async (data: UserToUpload): Promise<User> => await prisma.user.create({ data })
}
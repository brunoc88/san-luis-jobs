import { ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { prisma } from "../../lib/prisma"

export const requireActiveUserById = async (userId: number) => {
    
    let user = await prisma.user.findUnique({where:{id:userId}})
    
    if(!user) throw new NotFoundError()
    if(!user.isActive) throw new ForbiddenError("Usuario inactivo")
    
    return {
        id: user.id,
        role: user.role
    }
} 
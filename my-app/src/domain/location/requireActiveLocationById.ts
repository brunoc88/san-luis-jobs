import { ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import {prisma} from "@/lib/prisma"

export const requireActiveLocationById = async (locationId:number) : Promise<void> => {
    let location = await prisma.location.findUnique({where:{id:locationId}})

    if(!location) throw new NotFoundError()
    if(!location.isActive) throw new ForbiddenError('locacion inactiva')
}
import { prisma } from "@/lib/prisma";
import { Location } from "@prisma/client"

export const locationRepo = {
    create: async (location:string) : Promise<Location>=> await prisma.location.create({data:{name:location}}),

    findAllLocations: async () : Promise <Location[]>=> await prisma.location.findMany() 
}
import { prisma } from "@/lib/prisma";
import { Location } from "@prisma/client"

export const locationRepo = {
    create: async (location: string): Promise<Location> => await prisma.location.create({ data: { name: location } }),

    findAllLocations: async (): Promise<Location[]> => await prisma.location.findMany(),

    findLocationById: async (id: number): Promise<Location | null> => await prisma.location.findUnique({ where: { id } }),

    activateLocation: async (id: number): Promise<Location> => await prisma.location.update({ data: { isActive: true }, where: { id } }),

    deactivateLocation: async (id: number): Promise<Location> => await prisma.location.update({ data: { isActive: false }, where: { id } })
}
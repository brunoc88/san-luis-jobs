import { requireAdmin } from "@/domain/auth/requireAdmin"
import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { locationRepo } from "@/repositories/location.repository"
import { Locations } from "@/types/location/location.types"
import { NotFoundError } from "@/lib/errors/appError"
import { Location } from "@prisma/client"

export const locationService = {
    createLocation: async (userId: number, location: string) : Promise<Location>=> {
        let user = await requireActiveUserById(userId)

        requireAdmin(user.role)

        return await locationRepo.create(location)
    },

    getAllLocations: async (userId: number): Promise<Locations> => {
        let user = await requireActiveUserById(userId)

        requireAdmin(user.role)

        return await locationRepo.findAllLocations()
    },

    toggleLocationStatus: async (userId: number, id: number): Promise<Location> => {
        const user = await requireActiveUserById(userId)

        requireAdmin(user.role)

        const location = await locationRepo.findLocationById(id)
        if (!location) throw new NotFoundError()

        if (location.isActive) return await locationRepo.deactivateLocation(id)
        else return await locationRepo.activateLocation(id)
    },

    renameLocation: async (userId: number, locationId: number, name: string): Promise<Location> => {
        const user = await requireActiveUserById(userId)

        requireAdmin(user.role)

        const location = await locationRepo.findLocationById(locationId)
        if (!location) throw new NotFoundError()

        return await locationRepo.renameLocation(locationId, name)
    },

    getAllActiveLocations: async (userId: number): Promise<Locations> => {
        await requireActiveUserById(userId)

        return await locationRepo.findAllActiveLocations()
    }
}
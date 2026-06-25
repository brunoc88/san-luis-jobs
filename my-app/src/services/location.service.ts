import { requireAdmin } from "@/domain/auth/requireAdmin"
import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { locationRepo } from "@/repositories/location.repository"
import { Locations } from "@/types/location/location.types"

export const locationService = {
    createLocation: async (userId: number, location: string) => {   
        let user = await requireActiveUserById(userId)

        requireAdmin(user.role)

        await locationRepo.create(location)
        return
    },

    getAllLocations: async (userId: number): Promise<Locations> => {
        let user = await requireActiveUserById(userId)

        requireAdmin(user.role)

        return await locationRepo.findAllLocations()
    }
}
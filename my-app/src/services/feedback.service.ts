import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireAdmin } from "@/domain/auth/requireAdmin"
import { ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { feedbackRepo } from "@/repositories/feeback.repository"
import { userRepo } from "@/repositories/user.repository"

export const feedbackService = {
    create: async ({ opinion }: { opinion: string }, userId: number): Promise<void> => {
        const user = await requireActiveUserById(userId)

        await feedbackRepo.create({opinion, userId: user.id})
    },

    getFeedbackDetailsById: async (feedbackId:number, userId:number) => {
        const user = await requireActiveUserById(userId)
        requireAdmin(user.role)

        const feedbackData = await feedbackRepo.findById(feedbackId)
        if(!feedbackData) throw new NotFoundError()
        
        return feedbackData
    },

    deleteById: async (id:number, userId:number) => {
        const user = await requireActiveUserById(userId)
        requireAdmin(user.role)

        const feedbackData = await feedbackRepo.findById(id)
        if(!feedbackData) throw new NotFoundError()

        if(feedbackData.userId === user.id) throw new ForbiddenError('No puedes eliminar tu propia publicacion')

        const author = await userRepo.findById(feedbackData.userId)
        
        if(author?.role === 'superAdmin' && user.role === 'admin'){
            throw new ForbiddenError()
        }

        await feedbackRepo.deleteById(feedbackData.id)
    }
}
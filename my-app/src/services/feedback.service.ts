import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireAdmin } from "@/domain/auth/requireAdmin"
import { NotFoundError } from "@/lib/errors/appError"
import { feedbackRepo } from "@/repositories/feeback.repository"

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
    }
}
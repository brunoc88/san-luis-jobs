import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { feedbackRepo } from "@/repositories/feeback.repository"

export const feedbackService = {
    create: async ({ opinion }: { opinion: string }, userId: number): Promise<void> => {
        const user = await requireActiveUserById(userId)

        await feedbackRepo.create({opinion, userId: user.id})
    }
}
import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireAdmin } from "@/domain/auth/requireAdmin"
import { NotFoundError } from "@/lib/errors/appError"
import { complaintRepo } from "@/repositories/complaint.repository"

export const complaintService = {
    getComplaintById: async (id: number, userId: number) => {
        const user = await requireActiveUserById(userId)
        requireAdmin(user.role)

        const complaintData = await complaintRepo.findComplaintById(id)
        if (!complaintData) throw new NotFoundError()

        const complaintDetails = {
            id: complaintData.id,
            date: complaintData.createdAt,
            reportedBy: complaintData.user.username,
            jobReported: complaintData.job.title,
            jobAuthor: complaintData.job.user.username,
            reason: complaintData.reason,
            explanation: complaintData.explanation
        }
        return complaintDetails
    }
}
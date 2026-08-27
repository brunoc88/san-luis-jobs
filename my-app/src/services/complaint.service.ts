import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireAdmin } from "@/domain/auth/requireAdmin"
import { ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { complaintRepo } from "@/repositories/complaint.repository"
import { userRepo } from "@/repositories/user.repository"

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
    },

    deleteComplaintById: async (id: number, userId: number) => {
        const user = await requireActiveUserById(userId)
        requireAdmin(user.role)

        const complaintData = await complaintRepo.findComplaintById(id)
        if (!complaintData) throw new NotFoundError()

        if (complaintData.userId === user.id) throw new ForbiddenError('No puedes eliminar tu propia denuncia')

        const complaintAuthorData = await userRepo.findById(complaintData.userId)

        const sameRole = complaintAuthorData?.role === user.role

        const adminDeletingSuperAdmin =
            complaintAuthorData?.role === 'superAdmin' &&
            user.role === 'admin'

        if (sameRole || adminDeletingSuperAdmin) throw new ForbiddenError()

        await complaintRepo.deleteById(complaintData.id)
    },

    getAllActiveComplaints: async (userId:number, page:number) => {
        const user = await requireActiveUserById(userId)
        requireAdmin(user.role)

        const limit = 5
        const take = limit + 1
        const skip = (page - 1) * limit

        const complaints = await complaintRepo.findAllActiveComplaints(skip, take)

        const hasNextPage = complaints.length > limit

        const complaintsToReturn = hasNextPage
            ? complaints.slice(0, limit)
            : complaints

        const complaintsData = complaintsToReturn.map(c => ({
            id: c.id,
            date: c.createdAt,
            user: c.user.username,
            reason: c.reason
        }))

        return {
            complaints: complaintsData,
            hasNextPage
        }
    }
}
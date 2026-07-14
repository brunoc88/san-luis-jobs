import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireAdmin } from "@/domain/auth/requireAdmin"
import { requireActiveJobById } from "@/domain/job/requireActiveJobById"
import { requireActiveLocationById } from "@/domain/location/requireActiveLocationById"
import { ForbiddenError } from "@/lib/errors/appError"
import { jobRepo } from "@/repositories/job.repository"
import { userRepo } from "@/repositories/user.repository"
import { warningRepo } from "@/repositories/warning.repository"
import { CreateJobDto } from "@/types/job/job.type"
import { mailService } from "./mail.service"

export const jobService = {
    create: async (userId: number, data: CreateJobDto): Promise<number> => {
        const user = await requireActiveUserById(userId)

        await requireActiveLocationById(data.locationId)

        const { ...rest } = data
        const jobToCreate = { ...rest, userId: user.id }

        const job = await jobRepo.create(jobToCreate)
        return job.id
    },

    deleteJob: async (userId: number, jobId: number): Promise<void> => {
        const user = await requireActiveUserById(userId)

        const job = await requireActiveJobById(jobId)

        if (user.id !== job.autorId) throw new ForbiddenError('No tenés permiso para eliminar este empleo')

        await jobRepo.delete(jobId)

        return
    },

    suspendJob: async (
        userId: number,
        jobId: number,
        data: { reason: string }
    ): Promise<void> => {

        const user = await requireActiveUserById(userId)

        const job = await requireActiveJobById(jobId)

        requireAdmin(user.role)

        // Un administrador no puede suspender su propia publicación.
        if (user.id === job.autorId) {
            throw new ForbiddenError()
        }

        // Obtengo el autor de la publicación.
        const author = await requireActiveUserById(job.autorId)

        // Validación de jerarquía.
        const sameRole = user.role === author.role
        const adminSuspendingSuperAdmin =
            user.role === "admin" &&
            author.role === "superAdmin"

        if (sameRole) throw new ForbiddenError()
        if (adminSuspendingSuperAdmin) throw new ForbiddenError()

        // Crear advertencia.
        const warningToCreate = {
            userId: author.id,
            reason: data.reason,
            jobId
        }

        await warningRepo.create(warningToCreate)

        // Contar advertencias del usuario.
        const warningCount = await warningRepo.count(author.id)

        // Suspender la publicación.
        await jobRepo.suspend(jobId)

        // Si alcanzó el límite de advertencias, suspender la cuenta.
        if (warningCount >= 5) {
            await userRepo.suspend(author.id)

            mailService.sendAccountSuspendedEmail(author.email)
        } else {
            mailService.sendJobSuspendedEmail(author.email, job.title, data.reason)
        }
    }
}
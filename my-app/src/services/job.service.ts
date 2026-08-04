import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { requireAdmin } from "@/domain/auth/requireAdmin"
import { requireActiveJobById } from "@/domain/job/requireActiveJobById"
import { requireActiveLocationById } from "@/domain/location/requireActiveLocationById"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { jobRepo } from "@/repositories/job.repository"
import { userRepo } from "@/repositories/user.repository"
import { warningRepo } from "@/repositories/warning.repository"
import { CreateJobDto, SaveJobDto } from "@/types/job/job.type"
import { mailService } from "./mail.service"
import { JobState } from "@prisma/client"
import { applicationRepo } from "@/repositories/application.repository"

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


        if (user.id === job.autorId) {
            throw new ForbiddenError()
        }


        const author = await requireActiveUserById(job.autorId)


        const sameRole = user.role === author.role
        const adminSuspendingSuperAdmin =
            user.role === "admin" &&
            author.role === "superAdmin"

        if (sameRole) throw new ForbiddenError()
        if (adminSuspendingSuperAdmin) throw new ForbiddenError()


        await jobRepo.suspend(jobId)


        const warningToCreate = {
            userId: author.id,
            reason: data.reason,
            jobId
        }

        await warningRepo.create(warningToCreate)


        const warningCount = await warningRepo.count(author.id)


        if (warningCount === 5) {

            await jobRepo.suspendAllByAuthorId(author.id)
            await userRepo.suspend(author.id)

            mailService.sendAccountSuspendedEmail(author.email)
        } else {
            mailService.sendJobSuspendedEmail(author.email, job.title, data.reason)
        }
    },

    saveJob: async (userId: number, jobId: number): Promise<void> => {
        const user = await requireActiveUserById(userId)
        const job = await requireActiveJobById(jobId)

        if (user.id === job.autorId) throw new ForbiddenError("No puedes guardar tu misma publicacion")
        if (job.state === JobState.finished) throw new ForbiddenError("No es posible guardar una publicación finalizada.")

        const data: SaveJobDto = {
            userId: user.id,
            jobId: job.id
        }

        await jobRepo.saveJob(data)
        return
    },

    unsaveJob: async (
        userId: number,
        jobId: number
    ): Promise<void> => {

        await requireActiveUserById(userId)

        const savedJob = await jobRepo.getSavedJob(userId, jobId)

        if (!savedJob) {
            throw new NotFoundError()
        }

        await jobRepo.removeSavedJob(userId, jobId)
    },

    applyJob: async (userId: number, jobId: number): Promise<void> => {
        const user = await requireActiveUserById(userId)
        const job = await requireActiveJobById(jobId)

        if (job.state !== JobState.active) {
            throw new ForbiddenError("No es posible postularte en estos momentos.")
        }

        if (user.id === job.autorId) {
            throw new ForbiddenError("No puedes postularte a tu misma publicación")
        }

        const userData = await userRepo.findById(user.id)

        if (!userData?.cv) {
            throw new BadRequestError("Necesita cargar su cv")
        }

        const alreadyApplied = await applicationRepo.findByUserAndJob(
            user.id,
            job.id
        )

        if (alreadyApplied) {
            throw new ConflictError("Ya estás postulado a esta publicación")
        }

        const thisJob = await jobRepo.findJobById(job.id)

        let author = await userRepo.findById(job.autorId)

        if (thisJob?.applicationLimit) {
            const count = await applicationRepo.count(job.id)

            await applicationRepo.create(job.id, user.id)

            if (count + 1 === thisJob.applicationLimit) {
                await jobRepo.finishJob(job.id)
            }


            mailService.sendApplicationEmail(author?.email, userData.email, job.title, userData.cv)

            return
        }

        await applicationRepo.create(job.id, user.id)

        mailService.sendApplicationEmail(author?.email, userData.email, job.title, userData.cv)
        return
    },

    changeJobStatus: async (
        userId: number,
        jobId: number,
        state: JobState
    ): Promise<void> => {
        const user = await requireActiveUserById(userId)
        const job = await requireActiveJobById(jobId)

        if (user.id !== job.autorId) {
            throw new ForbiddenError()
        }

        if (job.state === JobState.finished) {
            const jobData = await jobRepo.findJobById(job.id)

            if (jobData?.applicationLimit) {
                const count = await applicationRepo.count(job.id)

                if (count >= jobData.applicationLimit) {
                    throw new BadRequestError(
                        "No es posible cambiar el estado porque la publicación ya alcanzó el límite de postulaciones. Aumentá el límite antes de reactivarla."
                    )
                }
            }
        }

        await jobRepo.changeJobStatus(state, job.id)
    }
}

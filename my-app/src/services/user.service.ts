import { RegisterUserInput, CreateUserData } from "@/types/user/user.register.type"
import bcrypt from "bcryptjs"
import { uploadFile, deleteFile } from "@/lib/cloudinary"
import { userRepo } from "@/repositories/user.repository"
import crypto from 'crypto'
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { UserInfoDto } from "@/types/user/user.info.type"
import { jobRepo } from "@/repositories/job.repository"


export const userService = {
    createAccount: async (data: RegisterUserInput, imageFile: File | null, cvFile: File | null): Promise<{ email: string, token: string }> => {
        let { email, username, password, description } = data

        let hashedPassword = await bcrypt.hash(password, 10)

        let imageUrl = process.env.DEFAULT_USER_IMAGE_URL!
        let imagePublicId: string | null = null

        let cvUrl: string | null = null
        let cvPublicId: string | null = null

        try {

            if (imageFile) {
                const uploadResult = await uploadFile(imageFile, "users")
                imageUrl = uploadResult.url
                imagePublicId = uploadResult.publicId
            }

            if (cvFile) {
                const uploadResult = await uploadFile(cvFile, "users-cv")
                cvUrl = uploadResult.url
                cvPublicId = uploadResult.publicId
            }

            const user: CreateUserData = {
                email,
                username,
                password: hashedPassword,
                description: description ? description : 'sin descripcion',
                pic: imageUrl,
                picPublicId: imagePublicId,
                cv: cvUrl,
                cvPublicId
            }

            const createdUser = await userRepo.create(user)

            const token = crypto.randomBytes(32).toString("hex")

            const tokenHash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex")



            const expiresAt = new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )

            await verificationTokenRepo.create({
                token: tokenHash,
                userId: createdUser.id,
                expiresAt
            })

            return { email, token }

        } catch (error) {
            // rollback si falla DB
            if (imagePublicId) {
                await deleteFile(imagePublicId)
            }
            if (cvPublicId) {
                await deleteFile(cvPublicId)
            }
            throw error
        }
    },

    confirmAccount: async (id: number, token: string) => {
        const user = await userRepo.findById(id)

        if (!user) throw new NotFoundError()
        if (user.isActive) throw new BadRequestError('cuenta ya activa')
        else await userRepo.active(user.id)

        await verificationTokenRepo.delete(token)
        return
    },

    getUserInfo: async (id: number, username: string) => {
        const user = await requireActiveUserById(id)

        const userData = await userRepo.findByUsername(username)

        if (!userData) {
            throw new NotFoundError()
        }

        const userInfo: UserInfoDto = {
            username: userData.username,
            pic: userData.pic,
            isPublic: userData.visibility
        }

        if (user.id !== userData.id && !userData.visibility) {
            return userInfo
        }

        userInfo.email = userData.email
        userInfo.description = userData.description

        return userInfo
    },

    getUserJobs: async (
        id: number,
        username: string,
        page: number,
        search?: string,
        sort: 'recent' | 'alphabetical' = 'recent'
    ) => {

        const user = await requireActiveUserById(id)

        const userData = await userRepo.findByUsername(username)

        if (!userData) throw new NotFoundError()

        if (user.id !== userData.id && !userData.visibility) {
            throw new ForbiddenError()
        }

        const limit = 5
        const skip = (page - 1) * limit
        const take = limit + 1

        const jobs = await jobRepo.findAllActiveJobsByUserId(
            userData.id,
            skip,
            take,
            search,
            sort
        )

        const hasNextPage = jobs.length > limit

        return {
            jobs: jobs
                .slice(0, limit)
                .map(j => ({
                    id: j.id,
                    title: j.title,
                    ...(user.id === userData.id && { state: j.state }),
                    date: j.createdAt
                })),
            hasNextPage
        }
    },

    getUserSavedJobs: async (
        id: number,
        username: string,
        page: number,
        search?: string,
        sort: 'recent' | 'alphabetical' = 'recent'
    ) => {

        const user = await requireActiveUserById(id)

        const userData = await userRepo.findByUsername(username)

        if (!userData) throw new NotFoundError()

        if (user.id !== userData.id) {
            throw new ForbiddenError()
        }

        const limit = 5
        const skip = (page - 1) * limit
        const take = limit + 1

        const savedJobs = await jobRepo.findSavedJobsByUserId(
            userData.id,
            skip,
            take,
            search,
            sort
        )

        const hasNextPage = savedJobs.length > limit

        return {
            jobs: savedJobs
                .slice(0, limit)
                .map(s => ({
                    id: s.job.id,
                    title: s.job.title,
                    state: s.job.state,
                    date: s.job.createdAt
                })),
            hasNextPage
        }
    },

    deactivateMyAccount: async (id: number, password: string) => {
        const user = await requireActiveUserById(id)

        const userData = await userRepo.findById(user.id)
        if (!userData) throw new NotFoundError()

        const isValid = await bcrypt.compare(password, userData.password)
        if (!isValid) throw new ForbiddenError('password incorrecto')

        await jobRepo.deactivateAllMyJobsById(userData.id)

        await jobRepo.deleteAllMySavedJobsById(userData.id)

        await userRepo.deactivateMyAccountById(userData.id)
    },

    changePrivacy: async (id: number) => {
        const user = await requireActiveUserById(id)

        const userData = await userRepo.findById(user.id)
        if (!userData) throw new NotFoundError()

        if (userData.visibility) await userRepo.changePrivacyById(userData.id, false)
        else await userRepo.changePrivacyById(userData.id, true)

    },

    changeUsername: async (id: number, username: string) => {
        const user = await requireActiveUserById(id)

        await userRepo.changeUsernameById(user.id, username)
    }
}

import { RegisterUserInput, CreateUserData } from "@/types/user/user.register.type"
import bcrypt from "bcryptjs"
import { uploadFile, deleteFile } from "@/lib/cloudinary"
import { userRepo } from "@/repositories/user.repository"
import crypto from 'crypto'
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import { BadRequestError, NotFoundError } from "@/lib/errors/appError"
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
        if (!userData) throw new NotFoundError()

        const jobs = await jobRepo.findAllActiveJobsByUserId(userData.id)
        const savedJobs = await jobRepo.findSavedJobsByUserId(userData.id)
        
        let userInfo: UserInfoDto = {
            username: userData.username,
            pic: userData.pic,
            isPublic: userData.visibility
        }

        if (user.id !== userData.id) {
            if (!userData.visibility) {
                return userInfo
            }
        }

        userInfo.email = userData.email
        userInfo.description = userData.description
        if (jobs) {
            userInfo.jobs = jobs.map(j => ({
                id: j.id,
                title: j.title,
                ...(user.id === userData.id && { state: j.state }),
                date: j.createdAt
            }))
        }

        if (savedJobs && userData.id === user.id) {
             userInfo.savedJobs = savedJobs.map(s => ({
                id: s.job.id,
                title: s.job.title,
                state: s.job.state,
                date: s.job.createdAt
            }))
        }
        return userInfo
    }
}

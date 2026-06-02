import { RegisterUserInput, CreateUserData } from "@/types/user/user.register.type"
import bcrypt from "bcryptjs"
import { uploadImage, deleteImage } from "@/lib/cloudinary"
import { userRepo } from "@/repositories/user.repository"
import crypto from 'crypto'
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import { BadRequestError, NotFoundError } from "@/lib/errors/appError"

export const userService = {
    createAccount: async (data: RegisterUserInput, imageFile: File | null): Promise<void> => {
        let { email, username, password, description } = data

        let hashedPassword = await bcrypt.hash(password, 10)

        let imageUrl = process.env.DEFAULT_USER_IMAGE_URL!
        let imagePublicId: string | null = null


        try {

            if (imageFile) {
                const uploadResult = await uploadImage(imageFile, "users")
                imageUrl = uploadResult.url
                imagePublicId = uploadResult.publicId
            }
            const user: CreateUserData = {
                email,
                username,
                password: hashedPassword,
                description: description ? description : 'sin descripcion',
                pic: imageUrl,
                picPublicId: imagePublicId
            }

            const createdUser = await userRepo.create(user)

            const token = crypto.randomUUID()
            const expiresAt = new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )
            
            await verificationTokenRepo.create({
                token,
                userId: createdUser.id,
                expiresAt
            })
            
            return 

        } catch (error) {
            // rollback si falla DB
            if (imagePublicId) {
                await deleteImage(imagePublicId)
            }
            throw error
        }
    },

    confirmAccount: async (id: number, token:string) => {
        const user = await userRepo.findById(id)

        if(!user) throw new NotFoundError()
        if(user.isActive) throw new BadRequestError('cuenta ya activa')
        else await userRepo.active(user.id)

        await verificationTokenRepo.delete(token)
        return
    }
}

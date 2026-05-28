import { RegisterUserInput, CreateUserData } from "@/types/user/user.register.type"
import bcrypt from "bcryptjs"
import { uploadImage, deleteImage } from "@/lib/cloudinary"
import { userRepo } from "@/repositories/user.repository"

export const userService = {
    createAccount: async (data: RegisterUserInput, imageFile: File | null) => {
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

            return await userRepo.create(user)
            
            
        } catch (error) {
            // rollback si falla DB
            if (imagePublicId) {
                await deleteImage(imagePublicId)
            }
            throw error
        }
    }
}

import { ValidationResult } from "@/types/user/user.validateRequest.type"
import userRegisterSchema from "./schemas/user/user.registerSchema"

const validateUserRequest = (formData: FormData) : ValidationResult => {

    const data = {
        email: formData.get('email')?.toString() || "",
        username: formData.get('username')?.toString() || "",
        password: formData.get('password')?.toString() || "",
        password2: formData.get('password2')?.toString() || "",
        description: formData.get('description')?.toString() || ""
    }
    const rawFile = formData.get('file')

    const file =
        rawFile instanceof File
            ? rawFile
            : null

    const parsed = userRegisterSchema.safeParse(data)

    if (!parsed.success) {
        return {
            ok: false,
            error: parsed.error.flatten().fieldErrors,
            status: 400
        }
    }

    return {
        ok: true,
        data: parsed.data,
        file
    }

}

export default validateUserRequest
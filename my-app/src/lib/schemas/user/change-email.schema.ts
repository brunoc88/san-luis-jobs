import {z} from "zod"

export const changeEmailSchema = z.object({
    email: z
        .string()
        .email('email invalido')
        .nonempty('debe ingresar un email')
})
import { z } from "zod"

export const deactivateAccountSchema = z.object({
    password: z
        .string()
        .trim()
        .min(8, 'minimo 8 caracteres')
        .nonempty('debe ingresar un password')
})
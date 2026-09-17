import { z } from "zod"

export const changeUsernameSchema = z.object({
    username: z
        .string()
        .trim()
        .max(25, 'maximo 25 caracteres')
        .min(5, 'min 5 caracteres')
        .nonempty('debe ingresar un nombre de usuario')
})
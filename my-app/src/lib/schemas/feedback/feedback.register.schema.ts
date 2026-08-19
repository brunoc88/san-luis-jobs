import {z} from "zod"

export const FeedBackRegisterSchema = z.object({
    opinion: z
    .string()
    .trim()
    .max(500, 'max 500 caracteres')
    .min(10, 'min 10 caracteres')
    .nonempty('debe ingresar una opinión')
})
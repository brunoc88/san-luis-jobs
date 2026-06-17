import {z} from "zod"

export const passworRecoverySchama = z.object({
    email: z
    .string()
    .email('email invalido')
    .nonempty('debe ingresar un email')
})
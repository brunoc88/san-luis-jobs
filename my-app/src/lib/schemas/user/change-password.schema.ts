import { z } from "zod"

export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .trim()
        .min(8, 'minimo 8 caracteres')
        .nonempty('debe ingresar un password'),

    password: z
        .string()
        .trim()
        .min(8, 'minimo 8 caracteres')
        .nonempty('debe ingresar un password'),

     password2: z
        .string()
        .trim()
        .min(8, 'minimo 8 caracteres')
        .nonempty('debe ingresar un password'),


}).refine(data => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2'],
})
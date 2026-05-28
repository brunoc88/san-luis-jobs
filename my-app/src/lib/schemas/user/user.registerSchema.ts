import { z } from "zod"

export const registerUserSchema = z.object({
    email: z
        .string()
        .email('email invalido')
        .nonempty('debe ingresar un email'),

    username: z
        .string()
        .trim()
        .max(25, 'maximo 25 caracteres')
        .min(5, 'min 5 caracteres')
        .nonempty('debe ingresar un nombre de usuario'),

    password: z
        .string()
        .trim()
        .min(6, 'minimo 6 caracteres')
        .nonempty('debe ingresar un password'),

    password2: z
        .string()
        .trim()
        .min(6, 'minimo 6 caracteres')
        .nonempty('debe ingresar un password'),

    description: z
        .string()
        .trim()
        .max(150, 'max 150 caracteres')
        .optional()

}).refine(data => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2'],
})

export default registerUserSchema.transform(({ password2, ...data }) => data)
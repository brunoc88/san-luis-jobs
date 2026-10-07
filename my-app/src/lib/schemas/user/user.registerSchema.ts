import { z } from "zod"

export const registerUserSchema = z.object({

    email: z
        .string()
        .trim()
        .nonempty('debe ingresar un email')
        .email('email invalido'),

    username: z
        .string()
        .trim()
        .nonempty('debe ingresar un nombre de usuario')
        .max(25, 'maximo 25 caracteres')
        .min(5, 'min 5 caracteres'),

    password: z
        .string()
        .trim()
        .nonempty('debe ingresar un password')
        .min(8, 'minimo 8 caracteres'),

    password2: z
        .string()
        .trim()
        .nonempty('debe ingresar un password')
        .min(8, 'minimo 8 caracteres'),

    description: z
        .string()
        .trim()
        .max(150, 'max 150 caracteres')
        .optional(),

    file: z
        .custom<FileList>()
        .optional(),

    cvFile: z
        .custom<FileList>()
        .optional()

}).refine(data => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2'],
})

export default registerUserSchema
//.transform(({ password2, ...data }) => data)
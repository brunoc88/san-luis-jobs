import {z} from "zod"

export const passwordRecoverySchema = z.object({
    email: z
    .string()
    .nonempty('debe ingresar un email')
    .email('email invalido')
    
})

export const newPasswordSchema = z.object({
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
    token: z
    .string()
    .nonempty('token vacio')

})
.refine(data => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2'],
})
.transform(({ password2, ...data }) => data)
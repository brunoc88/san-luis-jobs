import {z} from "zod"
import { UserAccountSearchSchema } from "./admin/user.account.search.schema"

export const PageSchema = z.object({
     page: z.coerce
        .number('Debe ingresar un numero')
        .int("La página debe ser un número entero.")
        .positive("La página debe ser mayor a 0.")
        .default(1)
})

export const PaginationSchema = z.object({
    page: z.coerce
        .number('Debe ingresar un numero')
        .int('La página debe ser un número entero.')
        .positive('La página debe ser mayor a 0.')
        .default(1),

    search: z
        .string()
        .trim()
        .optional(),

    sort: z
        .enum(['recent', 'alphabetical'], {
            error: 'Valor de orden inválido.'
        })
        .default('recent')
})
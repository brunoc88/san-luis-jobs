import {z} from "zod"

export const PageSchema = z.object({
     page: z.coerce
        .number('Debe ingresar un numero')
        .int("La página debe ser un número entero.")
        .positive("La página debe ser mayor a 0.")
        .default(1)
})
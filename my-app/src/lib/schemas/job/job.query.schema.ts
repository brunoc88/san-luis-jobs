import { JobModality, JobSchedule } from "@prisma/client"
import { z } from "zod"

const JobSort = z.enum(['recent', 'alphabetical', 'popular'], {
    error: 'Valor de orden inválido.'
});


export const JobQuerySchema = z.object({
    page: z.coerce
        .number('Debe ingresar un numero')
        .int("La página debe ser un número entero.")
        .positive("La página debe ser mayor a 0.")
        .default(1),

    limit: z.coerce
        .number('Debe ingresar un numero')
        .int("El límite debe ser un número entero.")
        .positive("El límite debe ser mayor a 0.")
        .default(10),

    search: z
        .string()
        .trim()
        .optional(),

    locationId: z.coerce
        .number('Debe ingresar un numero')
        .int("La ubicación debe ser un número entero.")
        .positive("La ubicación debe ser mayor a 0.")
        .optional(),

    schedule: z.nativeEnum(JobSchedule, {
        error: "Jornada inválida."
    }).optional(),

    modality: z.nativeEnum(JobModality, {
        error: "Modalidad inválida."
    }).optional(),

    sort: JobSort.optional()
})


export type JobQueryDto = z.infer<typeof JobQuerySchema>
import {z} from "zod"

export const SuspensionReasonSchema = z.object({
    reason: z
    .string()
    .trim()
    .nonempty('debe ingresar una razon')
    .min(10, "El motivo debe tener al menos 10 caracteres.")
    .max(200, "El motivo no puede superar los 200 caracteres.")
})
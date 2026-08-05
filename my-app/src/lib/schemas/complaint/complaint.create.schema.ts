import { z } from "zod"
import { ComplaintReason } from "@prisma/client"

export const ComplaintRegisterSchema = z.object({
    reason: z.nativeEnum(ComplaintReason, {
        error: "Denuncia inválida."
    }),

    explanation: z
        .string()
        .trim()
        .min(5, "Mínimo 5 caracteres.")
        .max(150, "Máximo 150 caracteres.")
        .optional()
})
.refine(
    (data) =>
        data.reason !== ComplaintReason.OTHER ||
        data.explanation !== undefined,
    {
        path: ["explanation"],
        message: "Debe especificar el motivo de la denuncia.",
    }
)
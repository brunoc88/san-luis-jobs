import {z} from "zod"
import {JobState} from "@prisma/client"

export const ChangesJobSchema = z.object({
    state: z.nativeEnum(JobState, {
    error: "Estado inválido."
  })
})
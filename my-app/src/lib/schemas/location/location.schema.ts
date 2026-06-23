import { z } from "zod"

const locationInputSchema = z.object({
    name: z.string()
        .trim()
        .nonempty("debe ingresar locacion")
        .toLowerCase()
        .min(2, "min 2 caracteres")
})

export default locationInputSchema
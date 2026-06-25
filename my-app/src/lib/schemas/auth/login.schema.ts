import { z } from "zod"

const LoginSchema = z.object({
  user: z
    .string()
    .trim()
    .nonempty("Debe ingresar email o nombre de usuario"),

  password: z
    .string()
    .trim()
    .nonempty("Debe ingresar un password")
    .min(8, "Min 8 caracteres")
})

export default LoginSchema
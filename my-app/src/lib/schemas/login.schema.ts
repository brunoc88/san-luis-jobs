import { z } from "zod"

const LoginSchema = z.object({
  user: z
    .string()
    .nonempty("Debe ingresar email o nombre de usuario")
    .transform(val => val.trim().toLowerCase()),

  password: z
    .string()
    .nonempty("Debe ingresar un password")
    .min(8, "Min 8 caracteres")
})

export default LoginSchema
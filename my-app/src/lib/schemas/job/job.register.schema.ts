import { z } from "zod";
import { JobModality, JobSchedule} from "@prisma/client";

export const JobRegisterSchema = z.object({
  title: z
    .string()
    .trim()
    .nonempty("Ingrese un título.")
    .min(10, "El título debe tener al menos 10 caracteres.")
    .max(100, "El título no puede superar los 100 caracteres."),

  description: z
    .string()
    .trim()
    .nonempty("Ingrese una descripción.")
    .min(30, "La descripción debe tener al menos 30 caracteres.")
    .max(5000, "La descripción es demasiado larga."),

  salary: z
    .coerce
    .number()
    .int("El salario debe ser un número entero.")
    .positive("El salario debe ser mayor a 0.")
    .optional(),

  applicationLimit: z
    .coerce
    .number()
    .int("El límite debe ser un número entero.")
    .positive("El límite debe ser mayor a 0.")
    .optional(),

  modality: z.nativeEnum(JobModality, {
    error: "Modalidad inválida."
  }),

  schedule: z.nativeEnum(JobSchedule, {
    error: "Jornada inválida."
  }),

  locationId: z
    .coerce
    .number()
    .int("La ubicación es inválida.")
    .positive("La ubicación es inválida.")
});
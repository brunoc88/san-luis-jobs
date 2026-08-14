# Schema — `JobQuerySchema` (Zod)

## Descripción

Schema de validación construido con [Zod](https://zod.dev/) que define la forma, tipos, coerciones, valores por defecto y mensajes de error de los query params aceptados por el endpoint `GET /api/jobs`. Es la fuente de verdad de qué filtros se pueden aplicar y qué formato debe tener cada uno.

## Código

```typescript
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
```

## Campos

| Campo | Tipo resultante | Requerido | Default | Reglas | Mensaje de error |
|---|---|---|---|---|---|
| `page` | `number` | No | `1` | Coercionado desde string, entero, positivo (`> 0`) | `"Debe ingresar un numero"` / `"La página debe ser un número entero."` / `"La página debe ser mayor a 0."` |
| `limit` | `number` | No | `10` | Coercionado desde string, entero, positivo (`> 0`) | `"Debe ingresar un numero"` / `"El límite debe ser un número entero."` / `"El límite debe ser mayor a 0."` |
| `search` | `string` | No | — | `trim()` aplicado | — |
| `locationId` | `number` | No | — | Coercionado desde string, entero, positivo (`> 0`) | `"Debe ingresar un numero"` / `"La ubicación debe ser un número entero."` / `"La ubicación debe ser mayor a 0."` |
| `schedule` | `JobSchedule` (enum Prisma) | No | — | Debe pertenecer al enum `JobSchedule` | `"Jornada inválida."` |
| `modality` | `JobModality` (enum Prisma) | No | — | Debe pertenecer al enum `JobModality` | `"Modalidad inválida."` |
| `sort` | `'recent' \| 'alphabetical' \| 'popular'` | No | — | Debe ser uno de los tres valores | `"Valor de orden inválido."` |

## Tipo inferido

```typescript
export type JobQueryDto = z.infer<typeof JobQuerySchema>
```

Equivalente a:

```typescript
type JobQueryDto = {
    page: number
    limit: number
    search?: string
    locationId?: number
    schedule?: JobSchedule
    modality?: JobModality
    sort?: 'recent' | 'alphabetical' | 'popular'
}
```

Este tipo es el que se propaga tipado hacia `jobService.getJobs`, evitando duplicar la definición de tipos entre la capa de validación y la capa de servicio.

## Detalles de implementación

### Coerción (`z.coerce.number()`)

Los query params siempre llegan como `string` (o `undefined`) desde `URLSearchParams`. `z.coerce.number()` intenta convertir ese string a `number` antes de aplicar el resto de las validaciones (`int`, `positive`). Si la conversión no es posible (ej: `"abc"`), falla con el mensaje `"Debe ingresar un numero"`.

### Enums basados en Prisma (`z.nativeEnum`)

`schedule` y `modality` validan contra los enums generados por Prisma (`JobSchedule`, `JobModality`), garantizando que solo se acepten valores que existan como estado válido en la base de datos.

### Enum propio (`JobSort`)

`sort` no proviene de Prisma sino que es un enum definido ad-hoc en el schema, ya que representa un criterio de ordenamiento (lógica de la API) y no un dato persistido.

### Valores por defecto

`page` y `limit` tienen `.default()`, por lo que **siempre** están presentes en `JobQueryDto` aunque no vengan en la query string. El resto de los campos son `.optional()` y pueden ser `undefined`.

## Ejemplo de validación

### Input válido

```
?page=2&limit=20&search=desarrollador&modality=remote&sort=popular
```

```json
{
  "page": 2,
  "limit": 20,
  "search": "desarrollador",
  "modality": "remote",
  "sort": "popular"
}
```

### Input inválido

```
?limit=-5&sort=random
```

```json
{
  "limit": ["El límite debe ser mayor a 0."],
  "sort": ["Valor de orden inválido."]
}
```

## Notas

- Al usar `error` como propiedad de configuración de mensaje (en vez de `message`), se asume una versión de Zod (v4) que soporta esa API unificada para mensajes de error personalizados.
- Cualquier nuevo filtro que se quiera soportar en el endpoint debe agregarse acá primero, y luego propagarse en el helper `validateQueryParams` y en el `jobService.getJobs`.
- Este schema es también la documentación viva de "qué se puede mandar" al endpoint, por lo que conviene mantenerlo como referencia principal ante cambios futuros.

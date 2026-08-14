# Service — `jobService.getJobs`

## Descripción

Método del `jobService` que contiene la lógica de negocio para obtener el listado de trabajos activos, aplicando filtros dinámicos, ordenamiento y paginación en base a los parámetros ya validados (`JobQueryDto`). Es la capa intermedia entre el controller y el repositorio (`jobRepo`), y es responsable de construir las condiciones de consulta (`where`, `orderBy`) y de dar forma (mapear) a la respuesta final.

## Código

```typescript
getJobs: async (filter: JobQueryDto) => {
        const skip = (filter.page - 1) * filter.limit

        const where: Prisma.JobWhereInput = {
            isActive: true,
            isSuspended: false,
            state: JobState.active
        }

        if (filter.search) {
            where.title = {
                contains: filter.search,
                mode: "insensitive"
            }
        }

        if (filter.locationId) {
            where.locationId = filter.locationId
        }

        if (filter.schedule) {
            where.schedule = filter.schedule
        }

        if (filter.modality) {
            where.modality = filter.modality
        }

        let orderBy: Prisma.JobOrderByWithRelationInput

        switch (filter.sort) {
            case "alphabetical":
                orderBy = {
                    title: "asc"
                }
                break

            case "popular":
                orderBy = {
                    applications: {
                        _count: "desc"
                    }
                }
                break

            case "recent":
            default:
                orderBy = {
                    createdAt: "desc"
                }
                break
        }

        const jobs = await jobRepo.findAllActiveJobs(
            where,
            skip,
            filter.limit + 1,
            orderBy
        )

        const hasNextPage = jobs.length > filter.limit

        const jobsToReturn = hasNextPage
            ? jobs.slice(0, filter.limit)
            : jobs

        return {
            jobs: jobsToReturn.map(job => ({
                id: job.id,
                title: job.title,
                createdAt: job.createdAt,
                modality: job.modality,
                schedule: job.schedule,
                username: job.user.username,
                locationName: job.location.name,
                applicants: job._count.applications
            })),
            pagination: {
                page: filter.page,
                limit: filter.limit,
                hasNextPage
            }
        }
    }
```

## Firma

```typescript
getJobs(filter: JobQueryDto) => Promise<{
    jobs: {
        id: number
        title: string
        createdAt: Date
        modality: JobModality
        schedule: JobSchedule
        username: string
        locationName: string
        applicants: number
    }[]
    pagination: {
        page: number
        limit: number
        hasNextPage: boolean
    }
}>
```

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `filter` | `JobQueryDto` | Query params ya validados y tipados por `JobQuerySchema` (incluye `page`, `limit` con defaults, y filtros opcionales). |

## Lógica paso a paso

### 1. Cálculo de paginación (`skip`)

```typescript
const skip = (filter.page - 1) * filter.limit
```

Calcula cuántos registros saltar según la página solicitada (paginación basada en offset).

### 2. Construcción del filtro base (`where`)

Se parte de una condición fija que todo resultado debe cumplir:

```typescript
{
    isActive: true,
    isSuspended: false,
    state: JobState.active
}
```

Esto garantiza que el endpoint **solo devuelve trabajos activos, no suspendidos y en estado `active`**, independientemente de los filtros opcionales que envíe el cliente.

### 3. Filtros dinámicos (mutación condicional del `where`)

Cada filtro opcional se agrega al objeto `where` **solo si vino presente** en `filter`:

| Filtro | Condición aplicada | Comportamiento |
|---|---|---|
| `search` | `title.contains` con `mode: "insensitive"` | Búsqueda parcial e insensible a mayúsculas/minúsculas sobre el título. |
| `locationId` | `locationId` exacto | Filtra por ubicación específica. |
| `schedule` | `schedule` exacto | Filtra por jornada (ej: full-time, part-time). |
| `modality` | `modality` exacto | Filtra por modalidad (ej: remoto, presencial). |

Este patrón (mutar `where` condicionalmente) es lo que le da al endpoint su comportamiento "mutante": la query final a la base de datos varía completamente según qué combinación de parámetros llegue.

### 4. Determinación del ordenamiento (`orderBy`)

Mediante un `switch` sobre `filter.sort`:

| Valor de `sort` | `orderBy` resultante |
|---|---|
| `"alphabetical"` | `{ title: "asc" }` |
| `"popular"` | `{ applications: { _count: "desc" } }` (ordena por cantidad de postulaciones) |
| `"recent"` o **default** (sin valor) | `{ createdAt: "desc" }` |

Si `filter.sort` es `undefined`, cae en el `default` y ordena por más recientes.

### 5. Consulta al repositorio (over-fetching para detectar página siguiente)

```typescript
const jobs = await jobRepo.findAllActiveJobs(
    where,
    skip,
    filter.limit + 1,
    orderBy
)
```

Se solicita **un registro extra** (`limit + 1`). Esta es la técnica utilizada para determinar `hasNextPage` sin necesidad de un segundo `COUNT` a la base de datos.

### 6. Cálculo de `hasNextPage` y recorte del resultado

```typescript
const hasNextPage = jobs.length > filter.limit
const jobsToReturn = hasNextPage ? jobs.slice(0, filter.limit) : jobs
```

- Si vinieron más registros que `limit`, significa que existe una página siguiente.
- En ese caso, se descarta el registro extra (`slice(0, filter.limit)`) antes de devolver los datos, para no filtrar de más al cliente.

### 7. Mapeo de respuesta (DTO de salida)

Cada `job` crudo (con relaciones anidadas de Prisma) se transforma a un objeto plano y aplanado:

```typescript
{
    id: job.id,
    title: job.title,
    createdAt: job.createdAt,
    modality: job.modality,
    schedule: job.schedule,
    username: job.user.username,        // aplanado desde la relación `user`
    locationName: job.location.name,    // aplanado desde la relación `location`
    applicants: job._count.applications // aplanado desde el conteo de relaciones
}
```

Esto evita exponer la estructura interna de Prisma (relaciones anidadas) directamente en la respuesta de la API.

### 8. Retorno final

```typescript
{
    jobs: jobsToReturn.map(...),
    pagination: {
        page: filter.page,
        limit: filter.limit,
        hasNextPage
    }
}
```

## Ejemplo

### Input

```typescript
{
    page: 1,
    limit: 2,
    modality: "remote",
    sort: "popular"
}
```

### Output

```json
{
  "jobs": [
    {
      "id": 12,
      "title": "Desarrollador Backend",
      "createdAt": "2026-08-01T10:00:00.000Z",
      "modality": "remote",
      "schedule": "full_time",
      "username": "empresa_x",
      "locationName": "Buenos Aires",
      "applicants": 34
    },
    {
      "id": 8,
      "title": "Diseñador UX",
      "createdAt": "2026-07-15T10:00:00.000Z",
      "modality": "remote",
      "schedule": "part_time",
      "username": "empresa_y",
      "locationName": "Córdoba",
      "applicants": 21
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "hasNextPage": true
  }
}
```

## Dependencias

| Dependencia | Rol |
|---|---|
| `jobRepo.findAllActiveJobs` | Ejecuta la consulta real contra la base de datos vía Prisma. |
| `Prisma.JobWhereInput` / `Prisma.JobOrderByWithRelationInput` | Tipos de Prisma usados para tipar `where` y `orderBy` de forma segura. |
| `JobState` | Enum de Prisma usado para fijar el estado `active` en el filtro base. |
| `JobQueryDto` | Tipo de entrada, inferido del schema Zod. |

## Notas

- La estrategia de `limit + 1` para calcular `hasNextPage` es eficiente porque evita una segunda query de conteo (`COUNT`), a costa de traer un registro de más que luego se descarta en memoria.
- El filtro base (`isActive`, `isSuspended`, `state`) no es configurable desde la query string: es una regla de negocio fija que protege qué trabajos son "públicamente listables".
- Si se agrega un nuevo filtro en el futuro, el patrón a seguir es: 1) agregarlo al `JobQuerySchema`, 2) agregarlo al helper `validateQueryParams`, 3) agregar el `if` correspondiente acá para mutar `where`.

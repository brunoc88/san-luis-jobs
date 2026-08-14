# Teoría — Tipos de Prisma vs. tipos propios

## Regla general

Prisma genera automáticamente todos los tipos necesarios para operar contra la base de datos (`WhereInput`, `CreateInput`, `UpdateInput`, `OrderByWithRelationInput`, `Select`, `Include`, etc.), por cada modelo definido en `schema.prisma`. Esto evita tener que escribirlos ni mantenerlos a mano.

Sin embargo, no todos los tipos de una aplicación deben salir de Prisma. La diferencia pasa por **qué representa el tipo**.

## ¿Cuándo usar los tipos generados por Prisma?

Cuando el tipo representa una **operación directa contra la base de datos**, es decir, cuando modela el modelo tal cual existe en la DB.

| Tipo de Prisma | Uso |
|---|---|
| `JobWhereInput` | Filtros en `findMany`, `findFirst`, `count`, `delete`, etc. |
| `JobWhereUniqueInput` | Filtros por campo único (`id`, `@unique`) en `findUnique`, `update`, `delete`. |
| `JobCreateInput` | Shape para crear un registro (`prisma.job.create`). |
| `JobUpdateInput` | Shape para actualizar un registro (todos los campos opcionales). |
| `JobOrderByWithRelationInput` | Ordenamiento, incluso por campos de relaciones. |
| `JobSelect` | Qué campos proyectar (lo que se usa con `select`). |
| `JobInclude` | Qué relaciones incluir. |

## ¿Cuándo conviene crear un tipo propio?

Cuando el tipo **no representa el modelo de la base de datos tal cual**, sino un **DTO de entrada/salida de la API** (el contrato con el cliente), con reglas propias que no existen en el modelo de Prisma.

Ejemplo: `JobQueryDto` (inferido de `JobQuerySchema` con Zod). Ese tipo incluye `page`, `limit` y `sort`, que son conceptos de la API (paginación, ordenamiento elegido por el usuario) y no campos que existan en el modelo `Job` de la base de datos. Ahí el tipo de Prisma no aplica.

## Regla práctica (resumen)

| Pregunta | Respuesta |
|---|---|
| ¿Es una operación directa contra la base (`where`, `create`, `update`, `select`)? | Usar los tipos generados por Prisma. |
| ¿Es la forma de entrada/salida de la API (validación, contrato con el cliente)? | Definir un tipo/schema propio (ej: con Zod). |

## Combinar Prisma con `select` propio: `Prisma.JobGetPayload`

Cuando se ejecuta una query con un `select` específico (como en `jobRepo.findAllActiveJobs`, que no trae el modelo `Job` completo sino una proyección con relaciones), el resultado no coincide exactamente con el modelo `Job` base. En vez de escribir ese tipo a mano, Prisma permite inferirlo automáticamente con `Prisma.JobGetPayload<{...}>`.

### Ejemplo

```typescript
type JobWithRelationsSelected = Prisma.JobGetPayload<{
  select: {
    id: true
    title: true
    createdAt: true
    modality: true
    schedule: true
    user: { select: { username: true } }
    location: { select: { name: true } }
    _count: { select: { applications: true } }
  }
}>
```

Esto genera automáticamente el tipo exacto del resultado de esa consulta puntual (con las relaciones aplanadas según el `select`), en vez de tener que declararlo manualmente y correr el riesgo de que quede desincronizado si cambia el `select` en el repo.

## Notas

- Los tipos generados por Prisma viven en el cliente generado (`@prisma/client` o la carpeta de salida configurada), no en el código fuente del proyecto.
- Cualquier cambio en `schema.prisma` requiere volver a correr `prisma generate` para que los tipos se actualicen.
- Usar `Prisma.JobGetPayload` es especialmente útil cuando un `select`/`include` complejo se reutiliza en varios lugares (ej: el repo y algún mapper), para no duplicar la definición del tipo de resultado.

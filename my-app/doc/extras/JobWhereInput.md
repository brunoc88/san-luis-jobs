# Teoría — `Prisma.JobWhereInput`

## ¿Qué es?

`Prisma.JobWhereInput` es un **tipo generado automáticamente por Prisma** a partir del modelo `Job` definido en `schema.prisma`. No se escribe a mano: Prisma lo genera al correr `prisma generate`, junto con muchos otros tipos auxiliares para cada modelo (`JobCreateInput`, `JobUpdateInput`, `JobOrderByWithRelationInput`, `JobSelect`, `JobInclude`, etc.).

## ¿Para qué sirve?

Define **la forma que puede tener el objeto `where`** al hacer una consulta sobre ese modelo (`findMany`, `findFirst`, `update`, `delete`, `count`, etc.). Le indica a TypeScript:

- Qué campos existen en el modelo y se pueden usar como filtro.
- Qué operadores/filtros acepta cada campo según su tipo (`String`, `Int`, `Boolean`, `DateTime`, enum, relación, etc.).
- Cómo combinar condiciones lógicas (`AND`, `OR`, `NOT`).

## Ejemplo de origen

Dado un modelo como:

```prisma
model Job {
  id          Int      @id @default(autoincrement())
  title       String
  isActive    Boolean
  isSuspended Boolean
  state       JobState
  modality    JobModality
  schedule    JobSchedule
  locationId  Int
  createdAt   DateTime
  // ...relaciones
}
```

Prisma genera (simplificado) algo equivalente a:

```typescript
type JobWhereInput = {
  id?: number | IntFilter
  title?: string | StringFilter
  isActive?: boolean | BoolFilter
  state?: JobState | EnumJobStateFilter
  modality?: JobModality | EnumJobModalityFilter
  locationId?: number | IntFilter
  createdAt?: Date | DateTimeFilter
  AND?: JobWhereInput[]
  OR?: JobWhereInput[]
  NOT?: JobWhereInput
  // ...resto de campos y relaciones
}
```

Por eso es válido escribir:

```typescript
where.title = {
    contains: filter.search,
    mode: "insensitive"
}
```

TypeScript sabe que `title` acepta ese objeto (`contains` / `mode`) porque así está tipado el filtro para campos `String` dentro de `JobWhereInput`.

## Uso en un `where` incremental

Al tipar explícitamente una variable como `Prisma.JobWhereInput`, se puede ir construyendo el filtro de forma condicional con seguridad de tipos:

```typescript
const where: Prisma.JobWhereInput = {
    isActive: true,
    isSuspended: false,
    state: JobState.active
}

if (filter.search) {
    where.title = { contains: filter.search, mode: "insensitive" }
}
```

## Beneficios concretos

| Beneficio | Detalle |
|---|---|
| Autocompletado | El editor sugiere los campos disponibles del modelo y los operadores válidos para cada tipo. |
| Seguridad de tipos | TypeScript marca error si se asigna una propiedad inexistente en el modelo, o un operador inválido para ese tipo de campo (ej: usar `contains` en un campo `Int`). |
| Sincronización con el schema | Si se agrega, renombra o elimina un campo en `schema.prisma`, el tipo se regenera y los errores de compilación aparecen automáticamente en el código que quedó desactualizado. |
| Menos documentación manual | El propio tipo actúa como referencia de qué se puede filtrar, sin necesidad de mantenerlo escrito a mano en otro lado. |

## Notas

- Existe un tipo `WhereInput` por cada modelo (`JobWhereInput`, `UserWhereInput`, etc.), todos generados de la misma forma.
- Estos tipos viven en el cliente generado de Prisma (`@prisma/client` o la carpeta de salida configurada), no en el código fuente del proyecto.
- Cualquier cambio en `schema.prisma` requiere volver a correr `prisma generate` para que los tipos se actualicen.

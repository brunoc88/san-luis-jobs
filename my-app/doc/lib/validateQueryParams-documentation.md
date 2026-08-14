# Helper — `validateQueryParams`

## Descripción

Función auxiliar encargada de tomar los `URLSearchParams` crudos de la request y validarlos/transformarlos usando el schema de Zod `JobQuerySchema`. Actúa como capa intermedia entre el controller y el schema de validación, normalizando el resultado en un formato uniforme (`ok`/`error`).

## Código

```typescript
import { JobQuerySchema } from "./schemas/job/job.query.schema"


export const validateQueryParams = (searchParams: URLSearchParams) => {

    const parsed = JobQuerySchema.safeParse({
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        locationId: searchParams.get("locationId") ?? undefined,
        schedule: searchParams.get("schedule") ?? undefined,
        modality: searchParams.get("modality")?? undefined,
        sort: searchParams.get("sort") ?? undefined
    })

    if (!parsed.success) {
        return {
            ok: false,
            error: parsed.error.flatten().fieldErrors,
            status: 400
        }
    }

    return {
        ok: true,
        data: parsed.data
    }
}
```

## Firma

```typescript
validateQueryParams(searchParams: URLSearchParams) => 
    | { ok: false, error: Record<string, string[] | undefined>, status: 400 }
    | { ok: true, data: JobQueryDto }
```

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `searchParams` | `URLSearchParams` | Objeto de query params extraído de la request (`req.nextUrl.searchParams`). |

## Comportamiento

1. Construye un objeto plano a partir de `searchParams`, extrayendo los campos esperados por el endpoint (`page`, `limit`, `search`, `locationId`, `schedule`, `modality`, `sort`).
2. Cada campo ausente se normaliza explícitamente a `undefined` (en vez de `null`, que es lo que devuelve `URLSearchParams.get()` cuando no existe la key). Esto es importante porque Zod trata `undefined` como "campo ausente" habilitando `.default()` y `.optional()`, mientras que `null` sería rechazado por los schemas.
3. Se ejecuta `JobQuerySchema.safeParse(...)`, que no lanza excepciones sino que devuelve un resultado discriminado (`success: true | false`).
4. **Caso inválido**: se retorna `{ ok: false, error, status: 400 }`, donde `error` es el resultado de `parsed.error.flatten().fieldErrors` (un objeto donde cada key es el nombre del campo y el valor es un array de mensajes de error).
5. **Caso válido**: se retorna `{ ok: true, data: parsed.data }`, donde `data` ya está tipado como `JobQueryDto` y con las transformaciones/coerciones/defaults del schema aplicadas (ej: `page` y `limit` ya son `number`, con sus valores por defecto si no vinieron en la query).

## Valor de retorno

- **Éxito**: objeto con `ok: true` y `data` (query params validados, coercionados y con defaults aplicados).
- **Error**: objeto con `ok: false`, `error` (errores agrupados por campo) y `status: 400`, listo para ser usado directamente en la respuesta HTTP del controller.

## Ejemplo

### Input

```
?page=2&limit=5&modality=remote
```

### Output (éxito)

```json
{
  "ok": true,
  "data": {
    "page": 2,
    "limit": 5,
    "modality": "remote"
  }
}
```

### Input inválido

```
?page=abc
```

### Output (error)

```json
{
  "ok": false,
  "error": {
    "page": ["Debe ingresar un numero"]
  },
  "status": 400
}
```

## Notas

- El uso de `safeParse` (en lugar de `parse`) evita tener que envolver la llamada en `try/catch`, delegando el control de flujo al valor de retorno.
- Al centralizar la extracción de params acá, el controller queda desacoplado del detalle de qué campos existen en la query string.
- Cualquier campo nuevo que se agregue al endpoint requiere actualizar tanto esta función (para extraerlo de `searchParams`) como el `JobQuerySchema`.

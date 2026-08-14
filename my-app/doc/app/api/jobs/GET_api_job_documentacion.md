# Controller — `GET /api/jobs`

## Descripción

Controlador (route handler de Next.js) encargado de manejar las solicitudes `GET` al endpoint `/api/jobs`. Se encarga de:

1. Extraer los query params de la request.
2. Validarlos mediante `validateQueryParams`.
3. Delegar la obtención de datos al `jobService`.
4. Devolver la respuesta HTTP correspondiente.

## Ubicación

```
/api/jobs
```

## Código

```typescript
export const GET = async (req: NextRequest) => {
    try {
        const searchParams = req.nextUrl.searchParams

        const validate = validateQueryParams(searchParams)
        if(!validate.ok) {
            return NextResponse.json({error:validate.error}, {status:validate.status})
        }
        const res = await jobService.getJobs(validate?.data)

        return NextResponse.json({ ok: true, jobs: res.jobs, pagination: res.pagination }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
```

## Flujo de ejecución

1. **Obtención de query params**: se leen desde `req.nextUrl.searchParams` (objeto `URLSearchParams`).
2. **Validación**: se invoca `validateQueryParams(searchParams)`, que internamente usa un schema de Zod (`JobQuerySchema`).
   - Si la validación falla (`validate.ok === false`), se responde inmediatamente con `400` y el detalle de errores por campo.
3. **Consulta de datos**: si la validación es exitosa, se llama a `jobService.getJobs(validate.data)`, pasando los parámetros ya tipados y saneados.
4. **Respuesta exitosa**: se devuelve `200` con:
   - `ok: true`
   - `jobs`: listado de trabajos resultante.
   - `pagination`: metadata de paginación.
5. **Manejo de errores inesperados**: cualquier excepción no controlada (por ejemplo, errores de base de datos) es capturada por el `try/catch` y delegada a `errorHandler`.

## Respuestas

### Éxito — `200 OK`

```json
{
    "ok": true,
    "jobs": [
        {
            "id": 15,
            "title": "Backend Developer Junior",
            "description": "Descripción del puesto...",
            "salary": 500000,
            "createdAt": "2026-08-14T12:00:00.000Z",
            "state": "active",
            "modality": "remote",
            "schedule": "fullTime",
            "username": "Juan",
            "locationName": "Villa Mercedes",
            "applicants": 8
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "hasNextPage": true
    }
}
```

### Error de validación — `400 Bad Request`

```json
{
  "error": {
    "page": ["La página debe ser mayor a 0."],
    "limit": ["Debe ingresar un numero"]
  }
}
```

### Error inesperado

Formato y status determinados por `errorHandler` (no incluido en este documento).

## Dependencias

| Dependencia | Rol |
|---|---|
| `validateQueryParams` | Valida y parsea los query params de entrada. |
| `jobService.getJobs` | Contiene la lógica de negocio para obtener los trabajos. |
| `errorHandler` | Manejo centralizado de errores no controlados. |
| `NextRequest` / `NextResponse` | Tipos y utilidades de Next.js para request/response. |

## Notas

- El controller no contiene lógica de negocio ni de validación propia: actúa como capa fina de orquestación (thin controller).
- El uso de `validate?.data` con optional chaining es redundante dado que en la rama de éxito `validate.data` siempre está definido, pero no genera efectos negativos.

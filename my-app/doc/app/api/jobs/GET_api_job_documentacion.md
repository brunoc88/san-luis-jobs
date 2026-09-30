# Controller — `GET /api/jobs`

## Descripción

Controlador (route handler de Next.js) encargado de manejar las solicitudes `GET` al endpoint `/api/jobs`. Se encarga de:

1. Extraer los query params de la request.

2. Validarlos mediante `validateQueryParams`.

3. Delegar la obtención de datos al `jobService`.

4. Devolver la respuesta HTTP correspondiente.

## Ubicación

```text
/api/jobs
```

## Rate Limit

El endpoint aplica un límite de solicitudes por dirección IP.

- **Límite:** 60 solicitudes.
- **Ventana:** 1 minuto.
- **Criterio:** dirección IP del cliente.
- **Clave:** `list-jobs:ip:${clientIp}`.
- Cuando se supera el límite, el endpoint responde con `429 Too Many Requests`.

El límite se aplica después de obtener la IP y validar los query params, antes de ejecutar `jobService.getJobs()`.

## Flujo de ejecución

1. **Obtención de query params**: se leen desde `req.nextUrl.searchParams` (objeto `URLSearchParams`).

2. **Obtención de IP**: se obtiene la dirección IP del cliente para aplicar el rate limit.

3. **Validación**: se invoca `validateQueryParams(searchParams)`, que internamente usa un schema de Zod (`JobQuerySchema`).
   - Si la validación falla (`validate.ok === false`), se responde inmediatamente con `400` y el detalle de errores por campo.

4. **Rate limit**: si la validación es exitosa, se verifica el límite de solicitudes correspondiente a la IP.
   - Si se supera el límite, se responde con `429 Too Many Requests`.

5. **Consulta de datos**: si la validación y el rate limit son exitosos, se llama a `jobService.getJobs(validate.data)`, pasando los parámetros ya tipados y saneados.

6. **Respuesta exitosa**: se devuelve `200` con:
   - `ok: true`
   - `jobs`: listado de trabajos resultante.
   - `pagination`: metadata de paginación.

7. **Manejo de errores inesperados**: cualquier excepción no controlada (por ejemplo, errores de base de datos) es capturada por el `try/catch` y delegada a `errorHandler`.

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

### Error de rate limit — `429 Too Many Requests`

Se devuelve cuando la dirección IP supera el límite de 60 solicitudes dentro de una ventana de 1 minuto.

### Error inesperado

Formato y status determinados por `errorHandler` (no incluido en este documento).

## Dependencias

| Dependencia | Rol |
|---|---|
| `validateQueryParams` | Valida y parsea los query params de entrada. |
| `jobService.getJobs` | Contiene la lógica de negocio para obtener los trabajos. |
| `errorHandler` | Manejo centralizado de errores no controlados. |
| `getClientIp` | Obtiene la dirección IP del cliente para aplicar el rate limit. |
| `rateLimiter` | Controla el límite de solicitudes por IP. |
| `rateLimitConfig.listJobs` | Contiene la configuración del rate limit del endpoint. |
| `NextRequest` / `NextResponse` | Tipos y utilidades de Next.js para request/response. |

## Notas

- El controller no contiene lógica de negocio ni de validación propia: actúa como capa fina de orquestación (thin controller).

- El uso de `validate?.data` con optional chaining es redundante dado que en la rama de éxito `validate.data` siempre está definido, pero no genera efectos negativos.

- El rate limit se aplica por IP porque el endpoint es público y no requiere autenticación.

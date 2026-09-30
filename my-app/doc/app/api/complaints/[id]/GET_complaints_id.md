# GET /api/complaints/:id

## Descripción

Obtiene el detalle de una denuncia específica.

El endpoint requiere una sesión activa y delega en el service la validación de permisos y la obtención de los datos de la denuncia.

## Endpoint

**GET** `/api/complaints/:id`

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID de la denuncia. Se convierte a número mediante `parseId`. |

## Rate Limit

El endpoint es exclusivo para administradores, por lo que el límite se aplica por usuario autenticado y no por IP.

- **Límite:** 30 solicitudes por minuto.
- **Ventana:** 1 minuto.
- **Clave:** `get-complaint:user:${userId}`
- Si se supera el límite, responde con **HTTP 429 Too Many Requests**.

La autorización mediante `requireAdmin(user.role)` continúa siendo responsabilidad del service. El rate limit no reemplaza la autorización.

## Implementación

```ts
export const GET = async (
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const userId = await requireSession()

    const { id } = await params
    const complaintId = parseId(id)

    const allowedByUserId = rateLimiter(
      `get-complaint:user:${userId}`,
      rateLimitConfig.getComplaint.user.limit,
      rateLimitConfig.getComplaint.user.windowMs
    )

    if (!allowedByUserId) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    const complaint = await complaintService.getComplaintById(
      complaintId,
      userId
    )

    return NextResponse.json(
      { ok: true, complaint },
      { status: 200 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}
```

## Flujo

1. Se obtiene el `userId` mediante `requireSession()`.
2. Se obtiene el parámetro `id` de la URL.
3. `parseId(id)` valida y convierte el ID a número.
4. Se aplica el rate limit por `userId`.
5. Si se supera el límite, se responde con HTTP `429`.
6. Se llama a `complaintService.getComplaintById(complaintId, userId)`.
7. Si la operación es exitosa, se devuelve la denuncia con HTTP `200`.
8. Cualquier error es delegado a `errorHandler(error)`.

## Configuración de Rate Limit

```ts
getComplaint: {
  user: {
    limit: 30,
    windowMs: 60 * 1000
  }
}
```

La key utilizada por el rate limiter es:

```ts
`get-complaint:user:${userId}`
```

## Respuesta exitosa

```json
{
  "ok": true,
  "complaint": {
    "id": 42,
    "date": "2026-08-24T16:37:34.613Z",
    "reportedBy": "admin2",
    "jobReported": "Backend Node.js Junior",
    "jobAuthor": "admin1",
    "reason": "FALSE_INFORMATION",
    "explanation": "all is fake"
  }
}
```

El objeto `complaint` contiene el detalle de la denuncia preparado por el service.

## Manejo de errores

El endpoint no maneja los errores individualmente. Todos los errores son enviados a:

```ts
errorHandler(error)
```

Esto permite centralizar la respuesta HTTP correspondiente según el tipo de error.

Si el usuario supera el límite de solicitudes, el controller responde directamente con `429 Too Many Requests`.

## Autenticación y autorización

- El endpoint requiere una sesión válida mediante `requireSession()`.
- La autorización específica para consultar denuncias es responsabilidad de `complaintService.getComplaintById()`.
- El service utiliza `requireAdmin(user.role)` para verificar que el usuario tenga permisos de administrador.

# GET /api/feedback/:id — Controller

## Descripción

Controller encargado de obtener los detalles de un feedback específico.

El endpoint está destinado a usuarios autenticados con permisos administrativos (`admin` o `superAdmin`).

## Rate Limit

El endpoint utiliza un rate limit basado en el usuario autenticado.

### Configuración

- **Límite:** 30 solicitudes
- **Ventana:** 1 minuto
- **Identificador:** `userId`
- **Clave:** `get-feedback:user:${userId}`

Al tratarse de un endpoint administrativo de lectura, se utiliza el mismo límite que para el listado de feedbacks.

Si el usuario supera el límite establecido, el endpoint responde con **HTTP 429**.

El rate limit se aplica después de validar el parámetro `id` y antes de ejecutar el service.

## Implementación

```ts
export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const userId = await requireSession()

    const { id } = await params
    const feedbackId = parseId(id)

    const allowedByUserId = rateLimiter(
      `get-feedback:user:${userId}`,
      rateLimitConfig.getFeedback.user.limit,
      rateLimitConfig.getFeedback.user.windowMs
    )

    if (!allowedByUserId) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    const feedback = await feedbackService.getFeedbackDetailsById(
      feedbackId,
      userId
    )

    return NextResponse.json(
      { ok: true, feedback },
      { status: 200 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}
```

## Flujo

```text
GET /api/feedback/:id
        ↓
requireSession()
        ↓
params.id
        ↓
parseId()
        ↓
rateLimiter()
        ↓
feedbackService.getFeedbackDetailsById()
        ↓
NextResponse.json()
```

## Responsabilidades

El controller se encarga exclusivamente de la capa HTTP:

- Obtener el usuario de la sesión.
- Obtener el parámetro `id` de la URL.
- Convertir y validar el ID mediante `parseId()`.
- Aplicar el rate limit por `userId`.
- Invocar el service.
- Construir la respuesta HTTP.
- Delegar el manejo de errores a `errorHandler()`.

No contiene lógica de negocio ni consultas directas a Prisma.

## Autenticación

La autenticación se realiza mediante:

```ts
const userId = await requireSession()
```

El `userId` se obtiene del contexto de sesión y no se recibe desde el cliente.

## Parámetro `id`

Next.js entrega el parámetro como `string`, por lo que se utiliza:

```ts
const { id } = await params

const feedbackId = parseId(id)
```

`parseId()` se encarga de validar que el identificador tenga el formato esperado antes de enviarlo al service.

## Rate Limit

Una vez obtenido y validado el `feedbackId`, se controla la cantidad de solicitudes realizadas por el usuario autenticado:

```ts
const allowedByUserId = rateLimiter(
  `get-feedback:user:${userId}`,
  rateLimitConfig.getFeedback.user.limit,
  rateLimitConfig.getFeedback.user.windowMs
)
```

Si se supera el límite:

```json
{
  "error": "Too many requests"
}
```

se devuelve HTTP `429`.

## Service

Una vez obtenido el ID válido, el usuario autenticado y superado el rate limit, el controller delega la lógica al service:

```ts
const feedback = await feedbackService.getFeedbackDetailsById(
  feedbackId,
  userId
)
```

El service es responsable de verificar que el usuario siga activo, comprobar su rol administrativo y obtener el feedback.

## Respuesta exitosa

```http
200 OK
```

```json
{
  "ok": true,
  "feedback": {
    "id": 15,
    "opinion": "La plataforma es muy fácil de usar.",
    "createdAt": "2026-08-20T14:30:00.000Z",
    "user": {
      "username": "usuario123"
    }
  }
}
```

La estructura exacta del objeto `feedback` depende de los datos seleccionados por el repository.

## Manejo de errores

Todos los errores son enviados a:

```ts
errorHandler(error)
```

Esto permite centralizar la conversión de errores de dominio y validación en respuestas HTTP.

Entre los posibles errores se encuentran:

- Usuario no autenticado.
- ID inválido.
- Usuario sin permisos administrativos.
- Feedback inexistente.
- Rate limit excedido.
- Errores inesperados.

## Separación de responsabilidades

```text
Controller
 ├── sesión
 ├── parámetros
 ├── parseId
 ├── rateLimiter
 ├── respuesta HTTP
 └── errorHandler
        ↓
Service
        ↓
Repository
        ↓
Database
```

El controller no determina si el usuario es admin ni decide si un feedback existe. Esas decisiones pertenecen a la capa de servicio.

El rate limit tampoco reemplaza las validaciones del service; funciona como una capa adicional de protección sobre el endpoint.

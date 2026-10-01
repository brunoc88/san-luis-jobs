# DELETE /api/feedback/:id — Controller

## Descripción

Controller encargado de eliminar físicamente un feedback específico.

El endpoint requiere una sesión autenticada y delega toda la lógica de autorización y eliminación al `feedbackService`.

## Rate Limit

El endpoint utiliza un rate limit basado en el usuario autenticado.

### Configuración

- **Límite:** 10 solicitudes
- **Ventana:** 1 hora
- **Identificador:** `userId`
- **Clave:** `delete-feedback:user:${userId}`

Al tratarse de una operación administrativa y destructiva, se utiliza un límite más restrictivo que para los endpoints administrativos de lectura.

Si el usuario supera el límite establecido, el endpoint responde con **HTTP 429**.

El rate limit se aplica después de validar y convertir el parámetro `id`, y antes de ejecutar el service.

## Implementación

```ts
export const DELETE = async ({
  params
}: {
  params: Promise<{ id: string }>
}) => {
  try {
    const userId = await requireSession()

    const { id } = await params
    const feedbackId = parseId(id)

    const allowedByUserId = rateLimiter(
      `delete-feedback:user:${userId}`,
      rateLimitConfig.deleteFeedback.user.limit,
      rateLimitConfig.deleteFeedback.user.windowMs
    )

    if (!allowedByUserId) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    await feedbackService.deleteById(feedbackId, userId)

    return NextResponse.json(
      { ok: true },
      { status: 200 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}
```

## Flujo

```text
DELETE /api/feedback/:id
        ↓
requireSession()
        ↓
params.id
        ↓
parseId()
        ↓
rateLimiter()
        ↓
feedbackService.deleteById()
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

No contiene lógica de negocio ni realiza consultas directas a Prisma.

## Autenticación

La autenticación se realiza mediante:

```ts
const userId = await requireSession()
```

El `userId` se obtiene de la sesión autenticada y no se recibe desde el cliente.

El service utilizará este ID para verificar que el usuario siga activo y determinar si tiene permisos suficientes para eliminar el feedback.

## Parámetro `id`

Next.js entrega el parámetro como `string`.

El controller lo procesa mediante:

```ts
const { id } = await params

const feedbackId = parseId(id)
```

`parseId()` valida y convierte el valor antes de enviarlo al service.

## Rate Limit

Una vez obtenido y validado el `feedbackId`, se controla la cantidad de solicitudes realizadas por el usuario autenticado:

```ts
const allowedByUserId = rateLimiter(
  `delete-feedback:user:${userId}`,
  rateLimitConfig.deleteFeedback.user.limit,
  rateLimitConfig.deleteFeedback.user.windowMs
)
```

Si se supera el límite:

```json
{
  "error": "Too many requests"
}
```

se devuelve HTTP `429`.

El rate limit protege el endpoint frente a una cantidad excesiva de operaciones de borrado, pero no reemplaza las validaciones de autorización ni las reglas de negocio del service.

## Service

La lógica de negocio se delega a:

```ts
await feedbackService.deleteById(feedbackId, userId)
```

El service es responsable de:

- Verificar que el usuario esté activo.
- Determinar el rol del usuario.
- Aplicar las reglas de autorización.
- Verificar que el feedback exista.
- Impedir que un usuario elimine su propio feedback.
- Aplicar la jerarquía entre `admin` y `superAdmin`.
- Solicitar el borrado físico al repository.

## Borrado físico

El controller no implementa directamente el borrado.

La eliminación real del registro ocurre en las capas inferiores, después de superar todas las validaciones de negocio.

El resultado esperado es que el registro de `Feedback` deje de existir físicamente en la base de datos.

## Respuesta exitosa

### 200 — Feedback eliminado

```json
{
  "ok": true
}
```

El controller devuelve `200 OK` cuando el service finaliza correctamente.

## Manejo de errores

Todos los errores son enviados a:

```ts
errorHandler(error)
```

Esto permite centralizar la conversión de errores de dominio y validación en respuestas HTTP.

Entre los posibles errores se encuentran:

- Usuario no autenticado.
- ID inválido.
- Usuario inactivo.
- Usuario sin permisos suficientes.
- Feedback inexistente.
- Intento de eliminar el propio feedback.
- `admin` intentando eliminar un feedback perteneciente a `superAdmin`.
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

El controller no decide quién puede eliminar un feedback ni realiza el borrado directamente. Esas responsabilidades pertenecen al service y repository respectivamente.

## Configuración del rate limit

La configuración se mantiene centralizada:

```ts
deleteFeedback: {
  user: {
    limit: 10,
    windowMs: 60 * 60 * 1000
  }
}
```

Esto evita definir valores de rate limit directamente dentro del controller y facilita modificar la política posteriormente.

## Estado actual

- [x] Autenticación mediante sesión.
- [x] Obtención del parámetro `id`.
- [x] Validación y conversión mediante `parseId()`.
- [x] Rate limit de 10 solicitudes por usuario cada 1 hora.
- [x] Delegación de la lógica al service.
- [x] Borrado físico delegado al service/repository.
- [x] Respuesta `200 OK` en caso de éxito.
- [x] Respuesta `429` al superar el rate limit.
- [x] Manejo centralizado de errores.
- [x] Separación de responsabilidades.

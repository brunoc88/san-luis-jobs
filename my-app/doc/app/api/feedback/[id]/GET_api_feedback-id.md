# GET /api/feedback/:id — Controller

## Descripción

Controller encargado de obtener los detalles de un feedback específico.

El endpoint está destinado a usuarios autenticados con permisos administrativos (`admin` o `superAdmin`).

## Implementación

```ts
export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const feedbackId = parseId(id)

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
feedbackService.getFeedbackDetailsById()
        ↓
NextResponse.json()
```

## Responsabilidades

El controller se encarga exclusivamente de la capa HTTP:

- Obtener el usuario de la sesión.
- Obtener el parámetro `id` de la URL.
- Convertir y validar el ID mediante `parseId()`.
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

## Service

Una vez obtenido el ID válido y el usuario autenticado, el controller delega la lógica al service:

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
- Errores inesperados.

## Separación de responsabilidades

```text
Controller
 ├── sesión
 ├── parámetros
 ├── parseId
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

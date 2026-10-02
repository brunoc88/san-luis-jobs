# PATCH /api/users/:id/activate — Controller

## Descripción

Este controller se encarga de procesar la solicitud para **activar una cuenta de usuario previamente desactivada voluntariamente como tambien de una cuenta creada pero que nunca fue activada**.

El controller no contiene reglas de negocio. Su responsabilidad es:

1. Obtener el usuario autenticado mediante la sesión.
2. Obtener y validar el `id` recibido como parámetro de ruta.
3. Aplicar el rate limit al usuario autenticado
4. Delegar la activación al `adminService`.
5. Aplicar el rate limit específico para el email.
6. Enviar un email de notificación al usuario cuya cuenta fue activada.
7. Retornar una respuesta HTTP exitosa.
8. Delegar el manejo de errores al `errorHandler`.

---

## Endpoint

**PATCH** `/api/users/:id/activate`

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID del usuario cuya cuenta se desea activar. |

El parámetro recibido desde la URL es convertido a `number` mediante `parseId`.

---

## Rate Limit

El endpoint aplica **dos límites independientes**.

### Rate Limit por usuario autenticado

- Límite: 10 solicitudes.
- Ventana: 1 hora.
- Identificador: userId.
- Key: activate-user:user:${userId}.
- Configuración: rateLimitConfig.activateUser.

Si se supera el límite, responde con:

429 Too Many Requests

```js
{
  "error": "Too many requests"
}
```

El rate limit se aplica después de obtener y validar el id, y antes de ejecutar la lógica de negocio.

Este rate limit controla la cantidad de solicitudes de activación que puede realizar el mismo usuario autenticado.

### Rate Limit por email

También se aplica un límite específico al email del usuario cuya cuenta fue activada.

- Límite: 3 solicitudes.
- Ventana: 15 minutos.
- Identificador: email.
-Key: activate-user:email:${email}.
- Configuración: rateLimitConfig.activateUser.email.

Si se supera el límite, responde con:

429 Too Many Requests
```js
{
  "error": "Too many requests"
}
```

Este rate limit protege específicamente el envío de emails y evita que una misma dirección pueda recibir una cantidad excesiva de notificaciones dentro de la ventana establecida.

El rate limit por usuario se aplica después de obtener y validar el id, y antes de ejecutar la lógica de negocio.

El rate limit por email se aplica después de que el service completa correctamente la activación y antes de enviar el email.

Los rate limits son una capa adicional de protección y no reemplazan la autenticación ni la autorización administrativa.
---

## Flujo
```text
Request
   │
   ▼
requireSession()
   │
   ▼
Obtener params.id
   │
   ▼
parseId(id)
   │
   ▼
Rate Limit por userId
   │
   ├── Límite excedido → HTTP 429
   │
   ▼
adminService.activateUserAccount()
   │
   ├── Error → errorHandler()
   │
   ▼
Obtiene email del usuario activado
   │
   ▼
Rate Limit por email
   │
   ├── Límite excedido → HTTP 429
   │
   ▼
mailService.sendAccountActivatedEmail()
   │
   ├── Error → errorHandler()
   │
   ▼
HTTP 200 { ok: true }
```
---

## Implementación

```ts
export const PATCH = async ({
    params
}: {
    params: Promise<{ id: string }>
}) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const inactiveUserId = parseId(id)

        const allowedByUserId = rateLimiter(
            `activate-user:user:${userId}`,
            rateLimitConfig.activateUser.user.limit,
            rateLimitConfig.activateUser.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { email } =
            await adminService.activateUserAccount(
                userId,
                inactiveUserId
            )

        const allowedByEmail = rateLimiter(
            `activate-user:email:${email}`,
            rateLimitConfig.activateUser.email.limit,
            rateLimitConfig.activateUser.email.windowMs
        )

        if (!allowedByEmail) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await mailService.sendAccountActivatedEmail(email)

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
```

---

## Responsabilidades

### `requireSession()`

Obtiene el ID del usuario autenticado.

El controller no determina si el usuario tiene permisos para activar cuentas. Esa validación pertenece al service.

---

### `parseId(id)`

Convierte y valida el parámetro `id` recibido desde la URL.

El resultado corresponde al usuario cuya cuenta se desea activar.

---

### `Rate Limit por usuario`

Controla la cantidad de solicitudes de activación realizadas por el mismo usuario autenticado.

La key utilizada es:

```js
`activate-user:user:${userId}`
```
El límite configurado es de 10 solicitudes por hora.

---

### `adminService.activateUserAccount()`

Delega toda la lógica de negocio relacionada con la activación.

El service se encarga de validar:

- Que el usuario solicitante esté activo.
- Que tenga permisos administrativos.
- Que el usuario objetivo exista.
- Que la cuenta no esté suspendida.
- Que la cuenta realmente esté inactiva.
- Que el rol del usuario objetivo sea compatible con el rol del administrador que realiza la acción.
- Si existe token viculado a al usuario que se desea activar.

Después de realizar la activación, el service devuelve el email del usuario afectado.

```ts
const { email } = await adminService.activateUserAccount(
    userId,
    inactiveUserId
)
```

El controller utiliza ese email únicamente para realizar la notificación.

---
### `Rate Limit por email`

Controla la cantidad de emails de activación que pueden enviarse a una misma dirección.

La key utilizada es:

```js
`activate-user:email:${email}`
```

El límite configurado es de 3 solicitudes cada 15 minutos.

Este límite protege específicamente el envío de emails y es independiente del límite aplicado al usuario autenticado.
---
### `mailService.sendAccountActivatedEmail()`

Envía un correo electrónico notificando al usuario que su cuenta fue activada.

El envío se realiza después de que el service haya completado correctamente la activación y el rate limit por email haya permitido la solicitud.


```ts
await mailService.sendAccountActivatedEmail(email)
```

El controller no construye el contenido del email; esa responsabilidad pertenece exclusivamente al `mailService`.

---

## Respuesta exitosa

Si la activación y el envío del email se completan correctamente:

**HTTP 200**

```json
{
    "ok": true
}
```

---

## Manejo de errores

Todos los errores producidos durante el flujo son capturados por el `try/catch` y enviados al `errorHandler`.

```ts
catch (error) {
    return errorHandler(error)
}
```

Esto mantiene centralizado el formato y tratamiento de las respuestas de error.

---
## Posibles errores

| Status | Descripción |
|----------|-------------|
| 400 | Identificador inválido |
| 401 | No existe una sesión válida |
| 403 | Usuario inactivo, sin permisos, cuenta suspendida o acción no permitida |
| 404 | Usuario objetivo inexistente |
| 409 | Conflicto durante la activación |
| 429 | Se superó el límite de solicitudes |
| 500 | Error interno del servidor |
---

## Separación de responsabilidades

| Capa | Responsabilidad |
|---|---|
| Controller | Orquestar la petición HTTP y aplicar rate limit|
| Service | Validar reglas de negocio y activar la cuenta |
| Repository | Modificar los datos en la base de datos |
| Mail Service | Enviar la notificación por email |
| Error Handler | Transformar errores en respuestas HTTP |

El controller funciona como **orquestador**, sin incorporar reglas de negocio ni acceso directo a Prisma.
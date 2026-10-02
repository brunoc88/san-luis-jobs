# GET /api/users/username/:username — Controller

## Responsabilidad del controller

Este controller se encarga de gestionar la petición HTTP para obtener la información de un usuario mediante su `username`.

El flujo del controller es:

1. Obtiene el `userId` de la sesión mediante `requireSession()`.
2. Obtiene el `username` desde los parámetros dinámicos de la ruta.
3. Aplica el rate limit por usuario autenticado.
4. Delega la operación al método correspondiente del servicio.
5. Devuelve la información recibida en una respuesta JSON con HTTP `200`.
6. Si ocurre un error, lo delega a `errorHandler()`.

---

## Endpoint

**GET** `/api/users/username/:username`

### Parámetros de ruta

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `username` | `string` | Sí | Username del usuario cuyo perfil se desea consultar. |

### Ejemplo

```text
GET /api/users/username/bruno
```

---

## Autenticación

Utiliza `requireSession()`.

El usuario debe tener una sesión activa para consultar la información del perfil.

La validación de que el usuario autenticado se encuentre activo pertenece al service mediante `requireActiveUserById()`.

---

## Rate limiting

El endpoint utiliza un rate limit por usuario autenticado.

- **Límite:** 30 solicitudes
- **Ventana:** 1 minuto
- **Key:** `get-user-info:user:${userId}`
- **Configuración:** `rateLimitConfig.getUserInfo.user`

El rate limit se aplica después de obtener el `username` y antes de ejecutar el service.

Si la solicitud no está permitida, responde con:

**HTTP 429 Too Many Requests**

```json
{
    "error": "Too many requests"
}
```

---

## Implementación

```ts
export const GET = async (
    { params }: { params: Promise<{ username: string }> }
) => {
    try {
        const userId = await requireSession()

        const { username } = await params

        const allowedByUserId = rateLimiter(
            `get-user-info:user:${userId}`,
            rateLimitConfig.getUserInfo.user.limit,
            rateLimitConfig.getUserInfo.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const user = await userService.getUserInfo(userId, username)

        return NextResponse.json(
            { ok: true, user },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
```

---

## Flujo

```text
Request

   │

   ▼

requireSession()

   │

   ▼

Obtener username

   │

   ▼

Rate limit por userId

   │

   ├── No permitido → HTTP 429

   │

   ▼

userService.getUserInfo()

   │

   ├── Error → errorHandler()

   │

   ▼

HTTP 200

{ ok, user }
```

---

## Separación de responsabilidades

| Capa | Responsabilidad |
|---|---|
| Controller | Autenticación, obtención de parámetros, rate limiting y respuesta HTTP |
| Service | Reglas de negocio y control de visibilidad |
| Repository | Búsqueda del usuario por username |
| Error Handler | Conversión de errores a respuestas HTTP |

El controller actúa como **orquestador** y no contiene reglas de negocio ni acceso directo a Prisma.

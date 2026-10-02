# GET /api/users/suspended — Controller

## Descripción

Este controller gestiona la obtención paginada del listado de cuentas suspendidas.

Su responsabilidad es recibir y validar los parámetros de consulta, aplicar el rate limit, delegar la lógica de negocio al `adminService` y construir la respuesta HTTP.

No contiene reglas de negocio ni acceso directo a la base de datos.

---

## Endpoint

**GET** `/api/users/suspended`

### Query params

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `page` | `number` | No | Página solicitada. Si no se proporciona, utiliza `1`. |
| `search` | `string` | No | Texto utilizado para buscar cuentas por username o email. |

### Ejemplos

```text
GET /api/users/suspended

GET /api/users/suspended?page=2

GET /api/users/suspended?search=common

GET /api/users/suspended?page=2&search=common
```

---

## Rate limiting

El endpoint utiliza un rate limit por usuario autenticado.

- **Límite:** 30 solicitudes
- **Ventana:** 1 minuto
- **Key:** `list-suspended-users:user:${userId}`
- **Configuración:** `rateLimitConfig.listSuspendedUsers.user`

El rate limit se aplica después de validar los parámetros de consulta y antes de ejecutar el service.

Si la solicitud supera el límite configurado, responde con:

**HTTP 429 Too Many Requests**

```json
{
    "error": "Too many requests"
}
```

---

## Implementación

```ts
export const GET = async (req: NextRequest) => {
    try {
        const userId = await requireSession()

        const searchParams = req.nextUrl.searchParams

        const validation = UserAccountSearchSchema.safeParse({
            page: searchParams.get("page") ?? undefined,
            search: searchParams.get("search") ?? undefined
        })

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }

        const page = validation.data.page
        const search = validation.data.search

        const allowedByUserId = rateLimiter(
            `list-suspended-users:user:${userId}`,
            rateLimitConfig.listSuspendedUsers.user.limit,
            rateLimitConfig.listSuspendedUsers.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { accounts, hasNextPage } =
            await adminService.getAllSuspendedAccounts(
                userId,
                page,
                search
            )

        return NextResponse.json(
            { ok: true, accounts, hasNextPage },
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

Obtener query params

   │

   ▼

UserAccountSearchSchema.safeParse()

   │

   ├── Inválido → HTTP 400

   │

   ▼

Obtener page y search

   │

   ▼

Rate limit por userId

   │

   ├── No permitido → HTTP 429

   │

   ▼

adminService.getAllSuspendedAccounts()

   │

   ├── Error → errorHandler()

   │

   ▼

HTTP 200

{ ok, accounts, hasNextPage }
```

---

## Responsabilidades

### 1. Autenticación

```ts
const userId = await requireSession()
```

Obtiene el ID del usuario autenticado.

El controller no determina si el usuario tiene permisos para consultar las cuentas suspendidas. Esa validación pertenece al service.

### 2. Obtención de query params

Los parámetros se obtienen mediante:

```ts
const searchParams = req.nextUrl.searchParams
```

Se extraen `page` y `search`.

El uso de `?? undefined` permite que Zod aplique correctamente los valores opcionales y los valores por defecto del schema.

### 3. Validación

Los parámetros son validados mediante `UserAccountSearchSchema.safeParse()`.

Si la validación falla, el controller responde con:

**HTTP 400 Bad Request**

```json
{
    "error": "..."
}
```

### 4. Rate limiting

Una vez validados los parámetros, se aplica el rate limit utilizando el ID del usuario autenticado:

```ts
const allowedByUserId = rateLimiter(
    `list-suspended-users:user:${userId}`,
    rateLimitConfig.listSuspendedUsers.user.limit,
    rateLimitConfig.listSuspendedUsers.user.windowMs
)
```

Si la solicitud no está permitida:

**HTTP 429 Too Many Requests**

### 5. Delegación al service

Una vez validados los parámetros y permitido el request por el rate limit, el controller delega la operación:

```ts
const { accounts, hasNextPage } =
    await adminService.getAllSuspendedAccounts(
        userId,
        page,
        search
    )
```

El service se encarga de las reglas de negocio, autorización, paginación y consulta de datos.

### 6. Respuesta exitosa

Si la operación finaliza correctamente:

**HTTP 200 OK**

```json
{
    "ok": true,
    "accounts": [],
    "hasNextPage": true
}
```

`accounts` contiene las cuentas obtenidas para la página solicitada.

`hasNextPage` indica si existen más resultados después de la página actual.

### 7. Manejo de errores

Los errores producidos durante el flujo son capturados y delegados al `errorHandler`:

```ts
catch (error) {
    return errorHandler(error)
}
```

Esto mantiene centralizado el tratamiento de errores HTTP.

---

## Separación de responsabilidades

| Capa | Responsabilidad |
|---|---|
| Controller | Autenticación, extracción/validación de parámetros, rate limiting y respuesta HTTP |
| Service | Reglas de negocio, autorización y paginación |
| Repository | Consulta de cuentas en la base de datos |
| Error Handler | Conversión de errores a respuestas HTTP |

El controller actúa como **orquestador** y no contiene lógica de negocio ni acceso directo a Prisma.

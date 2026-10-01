# GET /api/users

## Descripción

Endpoint encargado de obtener el listado paginado de cuentas de usuarios para la administración de cuentas.

El acceso y los resultados dependen del rol del usuario autenticado.

## Método y ruta

**GET** `/api/users`

## Rate Limit

El endpoint aplica un límite por usuario autenticado.

- Límite: 30 solicitudes.
- Ventana: 1 minuto.
- Identificador: userId.
- Key: list-users:user:${userId}.
- Configuración: rateLimitConfig.listUsers.

Si se supera el límite, responde con:

429 Too Many Requests

```js
{
  "error": "Too many requests"
}
```

El rate limit se aplica después de validar los parámetros page y search y antes de ejecutar adminService.getAllAccounts().

El rate limit es una capa adicional de protección y no reemplaza la autenticación ni la autorización administrativa.

## Flujo

1. Obtiene el `userId` mediante `requireSession()`.
2. Obtiene los parámetros `page` y `search` desde los query parameters.
3. Valida los parámetros mediante `UserAccountSearchSchema.safeParse()`.
4. Si la validación falla, responde con **400 Bad Request**.
5. Aplica el rate limit al usuario autenticado.
6. Si se supera el límite, responde con 429 Too Many Requests.
7. Llama a `adminService.getAllAccounts(userId, page, search)`.
8. El servicio verifica que el usuario esté activo y tenga permisos administrativos.
9. Devuelve las cuentas y el indicador `hasNextPage`.
10. Los errores son procesados mediante `errorHandler()`.

## Query parameters

### `page`

Número de página solicitado.

- Es opcional.
- Si no se proporciona, el schema utiliza `1`.
- Debe ser un número entero positivo.

### `search`

Texto opcional utilizado para buscar cuentas.

La búsqueda se realiza por prefijo sobre:

- `username`
- `email`

La comparación es insensible a mayúsculas/minúsculas.

## Respuestas

### 200 OK

Cuando la solicitud es válida y el usuario tiene permisos:

```json
{
  "ok": true,
  "accounts": [
    {
      "id": 1,
      "username": "usuario1",
      "email": "usuario1@test.com",
      "isActive": false,
      "role": "common"
    }
  ],
  "hasNextPage": true
}
```

### 400 Bad Request

Cuando los parámetros recibidos no cumplen con `UserAccountSearchSchema`.

```json
{
  "error": "..."
}
```

### 401 Unauthorized

Cuando no existe una sesión válida.

### 403 Forbidden
Cuando el usuario está inactivo o no posee permisos administrativos.

### 429 Too Many Requests
Cuando se supera el límite de solicitudes.

```js
{
  "error": "Too many requests"
}
```

### 500 Internal Server Error
Cuando ocurre un error interno del servidor.

## Ejemplo

```http
GET /api/users?page=2&search=bru
```

## Notas

- El controller no contiene reglas de negocio.
- La autorización y construcción de la consulta se realizan en `adminService.getAllAccounts()`.
- El listado utiliza paginación y devuelve como máximo 5 cuentas por página.
- El servicio verifica que el usuario esté activo y tenga permisos administrativos.

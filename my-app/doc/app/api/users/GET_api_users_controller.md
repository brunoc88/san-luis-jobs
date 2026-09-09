# GET /api/users

## Descripción

Endpoint encargado de obtener el listado paginado de cuentas de usuarios para la administración de cuentas.

El acceso y los resultados dependen del rol del usuario autenticado.

## Método y ruta

**GET** `/api/users`

## Flujo

1. Obtiene el `userId` mediante `requireSession()`.
2. Obtiene los parámetros `page` y `search` desde los query parameters.
3. Valida los parámetros mediante `UserAccountSearchSchema.safeParse()`.
4. Si la validación falla, responde con **400 Bad Request**.
5. Llama a `adminService.getAllAccounts(userId, page, search)`.
6. Devuelve las cuentas y el indicador `hasNextPage`.
7. Los errores son procesados mediante `errorHandler()`.

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

Otros errores de autenticación o autorización son delegados a `errorHandler()`.

## Ejemplo

```http
GET /api/users?page=2&search=bru
```

## Notas

- El controller no contiene reglas de negocio.
- La autorización y construcción de la consulta se realizan en `adminService.getAllAccounts()`.
- El listado utiliza paginación y devuelve como máximo 5 cuentas por página.

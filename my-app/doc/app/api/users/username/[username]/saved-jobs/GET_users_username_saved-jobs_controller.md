# `GET /api/users/username/:username/saved-jobs`

## Responsabilidad del controller

Este controller gestiona la petición HTTP para consultar los trabajos guardados asociados a un usuario identificado mediante su `username`.

## Flujo

1. Obtiene el `userId` de la sesión mediante `requireSession()`.

2. Obtiene los parámetros de consulta (`page`, `search` y `sort`) desde `req.nextUrl.searchParams`.

3. Valida los parámetros mediante `PaginationSchema`.

4. Si la validación falla, devuelve HTTP `400` junto con el error de validación.

5. Aplica el rate limit correspondiente al usuario autenticado mediante `rateLimiter()`.

6. Si el usuario supera el límite establecido, devuelve HTTP `429 Too Many Requests`.

7. Obtiene el `username` desde los parámetros dinámicos de la ruta.

8. Extrae `page`, `search` y `sort` de los datos validados.

9. Delega la operación correspondiente al servicio.

10. Devuelve el resultado en formato JSON con HTTP `200`.

11. Si ocurre un error, lo delega a `errorHandler()`.

## Parámetros de consulta

El controller recibe y valida:

- `page`

- `search`

- `sort`

La validación de estos parámetros queda a cargo de `PaginationSchema`.

## Rate limit

El endpoint utiliza un rate limit por usuario autenticado.

**Configuración:**

- Límite: `30 requests`
- Ventana: `1 minuto`
- Identificador: `userId`

**Key utilizada:**

```ts
`get-user-saved-jobs:user:${userId}`
```

La configuración se obtiene desde `rateLimitConfig.getUserSavedJobs.user`.

El rate limit se aplica después de validar los parámetros de consulta y antes de ejecutar la operación del servicio.

## Respuestas

- **200**: la petición fue procesada correctamente.

- **400**: los parámetros de consulta no superan la validación de `PaginationSchema`.

- **429**: el usuario superó el límite de requests permitido durante la ventana establecida.

- Otros errores: son delegados a `errorHandler()`.

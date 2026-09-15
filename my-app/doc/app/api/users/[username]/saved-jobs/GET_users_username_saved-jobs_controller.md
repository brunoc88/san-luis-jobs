# `GET /api/users/:username/saved-jobs`

## Responsabilidad del controller

Este controller gestiona la petición HTTP para consultar los trabajos guardados asociados a un usuario identificado mediante su `username`.

## Flujo

1. Obtiene el `userId` de la sesión mediante `requireSession()`.
2. Obtiene los parámetros de consulta (`page`, `search` y `sort`) desde `req.nextUrl.searchParams`.
3. Valida los parámetros mediante `PaginationSchema`.
4. Si la validación falla, devuelve HTTP `400` junto con el error de validación.
5. Obtiene el `username` desde los parámetros dinámicos de la ruta.
6. Extrae `page`, `search` y `sort` de los datos validados.
7. Delega la operación correspondiente al servicio.
8. Devuelve el resultado en formato JSON con HTTP `200`.
9. Si ocurre un error, lo delega a `errorHandler()`.

## Parámetros de consulta

El controller recibe y valida:

- `page`
- `search`
- `sort`

La validación de estos parámetros queda a cargo de `PaginationSchema`.

## Respuestas

- **200**: la petición fue procesada correctamente.
- **400**: los parámetros de consulta no superan la validación de `PaginationSchema`.
- Otros errores: son delegados a `errorHandler()`.

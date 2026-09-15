# GET /api/users/:username/jobs

### Responsabilidad del controller

Este controller gestiona la petición HTTP para obtener los trabajos creados por un usuario identificado mediante su `username`.

### Flujo

1. Obtiene el `userId` del usuario autenticado mediante `requireSession()`.
2. Obtiene los parámetros de consulta (`page`, `search` y `sort`) desde `req.nextUrl.searchParams`.
3. Valida dichos parámetros mediante `PaginationSchema`.
4. Si la validación falla, devuelve HTTP `400` junto con el error de validación.
5. Obtiene el `username` desde los parámetros dinámicos de la ruta.
6. Extrae de los datos validados `page`, `search` y `sort`.
7. Delega la operación a `userService.getUserJobs()` enviando el usuario autenticado, el `username` y los parámetros de consulta.
8. Devuelve el resultado en formato JSON con HTTP `200`.
9. Si ocurre un error durante el proceso, lo delega a `errorHandler()`.

### Parámetros de consulta

El controller recibe y valida:

- `page`: página solicitada.
- `search`: término de búsqueda.
- `sort`: criterio de ordenamiento.

La validación y los valores por defecto correspondientes quedan a cargo de `PaginationSchema`.

### Respuestas

- **200**: la operación fue procesada correctamente.
- **400**: los parámetros de consulta no cumplen con `PaginationSchema`.
- Otros errores: son delegados a `errorHandler()`.


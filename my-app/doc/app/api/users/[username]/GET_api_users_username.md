# GET /api/users/:username

## Responsabilidad del controller

Este controller se encarga exclusivamente de gestionar la petición HTTP para obtener la información de un usuario mediante su `username`.

El flujo del controller es:

1. Obtiene el `userId` de la sesión mediante `requireSession()`.
2. Obtiene el `username` desde los parámetros dinámicos de la ruta.
3. Delega la operación al método correspondiente del servicio.
4. Devuelve la información recibida en una respuesta JSON con HTTP `200`.
5. Si ocurre un error, lo delega a `errorHandler()`.


---



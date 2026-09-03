# PATCH /users/:id/suspended

## Controller

Este controller gestiona la solicitud `PATCH` para modificar el estado de una cuenta suspendida.

### Flujo

1. Obtiene el ID del usuario autenticado mediante `requireSession()`.
2. Obtiene el parámetro dinámico `id` de la URL.
3. Convierte y valida el `id` recibido mediante `parseId()`.
4. Envía el ID del usuario autenticado y el ID de la cuenta objetivo a `adminService.activateSuspendedAccount()`.
5. Si la operación finaliza correctamente, se manda email al usuario y se responde con `200 OK` y `{ ok: true }`.
6. Si ocurre un error, lo delega a `errorHandler()`.

### Responsabilidades del controller

- Obtener la sesión del usuario.
- Obtener y parsear el parámetro `id`.
- Invocar al service correspondiente.
- Mandar email para avisarle al usuario.
- Generar la respuesta HTTP exitosa.
- Delegar el manejo de errores.

La lógica de autorización y las reglas de negocio pertenecen al service.

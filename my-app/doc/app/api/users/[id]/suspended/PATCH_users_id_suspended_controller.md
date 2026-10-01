# PATCH /users/:id/suspended

## Controller

Este controller gestiona la solicitud `PATCH` para modificar el estado de una cuenta suspendida.

### Flujo

1. Obtiene el ID del usuario autenticado mediante `requireSession()`.

2. Obtiene el parámetro dinámico `id` de la URL.

3. Convierte y valida el `id` recibido mediante `parseId()`.

4. Aplica el rate limit utilizando el ID del usuario autenticado como identificador.

5. Si se supera el límite permitido, responde con `429 Too Many Requests`.

6. Envía el ID del usuario autenticado y el ID de la cuenta objetivo a `adminService.activateSuspendedAccount()`.

7. Si la operación finaliza correctamente, se manda email al usuario y se responde con `200 OK` y `{ ok: true }`.

8. Si ocurre un error, lo delega a `errorHandler()`.

### Rate Limit

- **Límite:** 5 solicitudes por hora.
- **Identificador:** `userId` del usuario autenticado.
- **Key:** `activate-suspended-account:user:${userId}`
- **Configuración:** `rateLimitConfig.activateSuspendedAccount.user`
- **Respuesta al superar el límite:** `429 Too Many Requests`.

El rate limit se aplica después de validar el parámetro `id` y antes de ejecutar el service.

### Responsabilidades del controller

- Obtener la sesión del usuario.
- Obtener y parsear el parámetro `id`.
- Aplicar el rate limit.
- Invocar al service correspondiente.
- Mandar email para avisarle al usuario.
- Generar la respuesta HTTP exitosa.
- Delegar el manejo de errores.

La lógica de autorización y las reglas de negocio pertenecen al service.
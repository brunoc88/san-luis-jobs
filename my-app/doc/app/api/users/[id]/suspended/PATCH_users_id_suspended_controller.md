# PATCH /users/:id/suspended

## Controller

Este controller gestiona la solicitud `PATCH` para modificar el estado de una cuenta suspendida.

### Flujo

1. Obtiene el ID del usuario autenticado mediante `requireSession()`.

2. Obtiene el parámetro dinámico `id` de la URL.

3. Convierte y valida el `id` recibido mediante `parseId()`.

4. Aplica el rate limit por usuario utilizando el ID del usuario autenticado como identificador.

5. Si se supera el límite por usuario, responde con `429 Too Many Requests`.

6. Envía el ID del usuario autenticado y el ID de la cuenta objetivo a `adminService.activateSuspendedAccount()`.

7. El service devuelve el email del usuario cuya suspensión fue levantada.

8. Aplica el rate limit específico para ese email.

9. Si se supera el límite por email, responde con `429 Too Many Requests`.

10. Si la solicitud se encuentra dentro del límite permitido, envía el email al usuario mediante `mailService.sendSuspendedAccountActivatedEmail()`.

11. Si todo finaliza correctamente, responde con `200 OK` y `{ ok: true }`.

12. Si ocurre un error, lo delega a `errorHandler()`.

### Rate Limit

El endpoint aplica **dos límites independientes**.

#### Rate Limit por usuario

- **Límite:** 5 solicitudes por hora.
- **Identificador:** `userId` del usuario autenticado.
- **Key:** `activate-suspended-account:user:${userId}`
- **Configuración:** `rateLimitConfig.activateSuspendedAccount.user`
- **Respuesta al superar el límite:** `429 Too Many Requests`.

El rate limit se aplica después de validar el parámetro `id` y antes de ejecutar el service.

#### Rate Limit por email

- **Límite:** 3 solicitudes cada 15 minutos.
- **Identificador:** email del usuario afectado.
- **Key:** `activate-suspended-account:email:${email}`
- **Configuración:** `rateLimitConfig.activateSuspendedAccount.email`
- **Respuesta al superar el límite:** `429 Too Many Requests`.

El rate limit por email se aplica después de que el service completa correctamente la operación y antes de enviar el email.

Este límite protege específicamente el envío de notificaciones a una misma dirección de correo.

### Responsabilidades del controller

- Obtener la sesión del usuario.
- Obtener y parsear el parámetro `id`.
- Aplicar el rate limit por usuario.
- Invocar al service correspondiente.
- Aplicar el rate limit por email.
- Mandar el email para avisarle al usuario.
- Generar la respuesta HTTP exitosa.
- Delegar el manejo de errores.

La lógica de autorización y las reglas de negocio pertenecen al service.
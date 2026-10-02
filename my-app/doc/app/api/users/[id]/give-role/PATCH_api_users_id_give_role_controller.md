# PATCH /api/users/:id/give-role — Controller

## Descripción

El controller maneja la petición `PATCH /api/users/:id/give-role` para darle o quitarle el rol a un 
usuario.

Su responsabilidad es coordinar la solicitud entre la sesión, el service de administración y el service de correo.

## Rate Limit

El endpoint aplica **dos límites independientes**.

### Rate Limit por usuario autenticado

- Límite: 5 solicitudes.
- Ventana: 1 hora.
- Identificador: userId.
- Key: toggle-user-role:user:${userId}.
- Configuración: rateLimitConfig.toggleUserRole.

Si se supera el límite, responde con:

429 Too Many Requests

```js
{
  "error": "Too many requests"
}
```

El rate limit se aplica después de validar y convertir el id mediante parseId() y antes de ejecutar la lógica de negocio.

### Rate Limit por email

También se aplica un límite específico al email del usuario afectado.

- Límite: 3 solicitudes.
- Ventana: 15 minutos.
- Identificador: email.
- Key: toggle-user-role:email:${email}.
- Configuración: rateLimitConfig.toggleUserRole.email.

Si se supera el límite, responde con:

429 Too Many Requests
```js
{
  "error": "Too many requests"
}
```
Este rate limit protege específicamente el envío de las notificaciones por email.

El rate limit por email se aplica después de que adminService.toggleRole() finaliza correctamente y antes de enviar la notificación correspondiente.

Los rate limits son una capa adicional de protección y no reemplazan la autenticación ni las validaciones de permisos realizadas por el service.

## Flujo

1. Obtiene el ID del usuario autenticado mediante `requireSession()`.
2. Obtiene el parámetro `id` de la URL.
3. Valida y convierte el parámetro mediante `parseId()`.
4. Aplica el rate limit al usuario autenticado
5. Si se supera el límite, responde con 429 Too Many Requests.
6. Envía ambos IDs a `adminService.toggleRole()`.
7. Recibe del service el email del usuario afectado y el resultado de la operación.
8. Aplica el rate limit por email.
9. Si se supera el límite, responde con 429 Too Many Requests.
10. Según el resultado:
   - `granted` → envía `sendAdminRoleGrantedEmail()`.
   - `revoked` → envía `sendAdminRoleRevokedEmail()`.
11. Si todo finaliza correctamente, responde con `200 OK`.
12. Cualquier error es enviado al `errorHandler()`.

## Respuesta exitosa

```json
{
  "ok": true
}
```

## Posibles errores

| Status | Descripción |
|----------|-------------|
| 400 | Identificador inválido |
| 401 | No existe una sesión válida |
| 403 | Usuario sin permisos o acción no permitida|
| 404 | Usuario objetivo inexistente |
| 409 | Conflicto durante la activación |
| 429 | Se superó el límite de solicitudes |
| 500 | Error interno del servidor |


## Responsabilidades

El controller **no contiene lógica de negocio relacionada con los roles**.

No decide si el usuario puede recibir o perder el rol, ni realiza directamente la modificación en la base de datos. Esa responsabilidad corresponde al `adminService`.

Su función se limita a:

- gestionar la sesión;
- procesar el parámetro de ruta;
- aplicar el rate limit;
- delegar la operación al service;
- aplicar el rate limit por email;
- enviar la notificación correspondiente;
- devolver la respuesta HTTP;
- delegar los errores al `errorHandler`.

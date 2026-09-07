# PATCH /api/users/:id/give-role — Controller

## Descripción

El controller maneja la petición `PATCH /api/users/:id/give-role` para darle o quitarle el rol a un 
usuario.

Su responsabilidad es coordinar la solicitud entre la sesión, el service de administración y el service de correo.

## Flujo

1. Obtiene el ID del usuario autenticado mediante `requireSession()`.
2. Obtiene el parámetro `id` de la URL.
3. Valida y convierte el parámetro mediante `parseId()`.
4. Envía ambos IDs a `adminService.toggleRole()`.
5. Recibe del service el email del usuario afectado y el resultado de la operación.
6. Según el resultado:
   - `granted` → envía `sendAdminRoleGrantedEmail()`.
   - `revoked` → envía `sendAdminRoleRevokedEmail()`.
7. Si todo finaliza correctamente, responde con `200 OK`.
8. Cualquier error es enviado al `errorHandler()`.

## Respuesta exitosa

```json
{
  "ok": true
}
```

## Responsabilidades

El controller **no contiene lógica de negocio relacionada con los roles**.

No decide si el usuario puede recibir o perder el rol, ni realiza directamente la modificación en la base de datos. Esa responsabilidad corresponde al `adminService`.

Su función se limita a:

- gestionar la sesión;
- procesar el parámetro de ruta;
- delegar la operación al service;
- enviar la notificación correspondiente;
- devolver la respuesta HTTP;
- delegar los errores al `errorHandler`.

# Documentación - POST `/api/auth/reset-password`

## Objetivo

Completar el proceso de recuperación de contraseña permitiendo al
usuario establecer una nueva contraseña utilizando un token de
recuperación previamente validado.

Una vez finalizada la operación, la contraseña del usuario se actualiza,
el token de recuperación se invalida y se envía un correo electrónico
notificando el cambio.

------------------------------------------------------------------------

## Flujo de ejecución

1.  Validar el cuerpo de la solicitud mediante `newPasswordSchema`.
2.  Si la validación falla, responder con el error correspondiente.
3.  Delegar la lógica de negocio a `authService.resetPassword()`.
4.  Enviar un correo de confirmación mediante
    `mailService.sendPasswordChangedEmail()`.
5.  Responder `200 OK`.

------------------------------------------------------------------------

## Responsabilidades

### Controller

-   Validar el cuerpo de la solicitud.
-   Delegar el cambio de contraseña al `authService`.
-   Enviar el correo de confirmación.
-   Devolver la respuesta HTTP.
-   Delegar el manejo de errores al `errorHandler`.

### AuthService

El servicio es responsable de:

-   Validar el token recibido.
-   Verificar que el usuario asociado exista.
-   Verificar que la cuenta se encuentre activa.
-   Generar el hash de la nueva contraseña.
-   Actualizar la contraseña del usuario.
-   Eliminar el token de recuperación para impedir su reutilización.
-   Devolver el email del usuario para el envío de la notificación.

### MailService

Envía un correo electrónico informando que la contraseña fue actualizada
correctamente.

------------------------------------------------------------------------

## Respuesta exitosa

``` http
HTTP/1.1 200 OK
```

``` json
{
    "ok": true
}
```

------------------------------------------------------------------------

## Errores

El endpoint delega el manejo de errores al `errorHandler`.

Entre los posibles escenarios se encuentran:

-   Error de validación de los datos enviados.
-   Token inexistente.
-   Token inválido.
-   Token expirado.
-   Usuario inexistente.
-   Cuenta inactiva.

------------------------------------------------------------------------

## Consideraciones de seguridad

-   La nueva contraseña nunca se almacena en texto plano.
-   Antes de persistirse se genera un hash utilizando `bcrypt`.
-   El token de recuperación se elimina inmediatamente después del
    cambio de contraseña.
-   Cada token puede utilizarse una única vez.
-   El usuario recibe un correo electrónico notificando el cambio de
    contraseña como medida adicional de seguridad.

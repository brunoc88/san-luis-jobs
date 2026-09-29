# Documentación - POST `/api/auth/reset-password`

## Objetivo

Completar el proceso de recuperación de contraseña permitiendo al

usuario establecer una nueva contraseña utilizando un token de

recuperación previamente validado.

Una vez finalizada la operación, la contraseña del usuario se actualiza,

el token de recuperación se invalida y se envía un correo electrónico

notificando el cambio.

Además, el endpoint cuenta con **rate limiting por IP y por token** para limitar solicitudes excesivas durante el proceso de cambio de contraseña.

------------------------------------------------------------------------

## Flujo de ejecución

1\.  Validar el cuerpo de la solicitud mediante `newPasswordSchema`.

2\.  Si la validación falla, responder con el error correspondiente.

3\.  Aplicar el rate limit por IP.

4\.  Si se supera el límite por IP, responder `429 Too Many Requests`.

5\.  Aplicar el rate limit por token.

6\.  Si se supera el límite por token, responder `429 Too Many Requests`.

7\.  Delegar la lógica de negocio a `authService.resetPassword()`.

8\.  Enviar un correo de confirmación mediante

    `mailService.sendPasswordChangedEmail()`.

9\.  Responder `200 OK`.

------------------------------------------------------------------------

## Rate Limit

El endpoint utiliza dos límites independientes:

- **Por IP:** `5` solicitudes cada `60 segundos`.
- **Por token:** `3` solicitudes cada `15 minutos`.

Las claves utilizadas son:

```text
reset-password:ip:{clientIp}
reset-password:token:{token}
```

El límite por IP controla la cantidad de solicitudes realizadas desde un mismo cliente.

El límite por token evita que una misma recuperación de contraseña sea utilizada repetidamente, incluso si las solicitudes provienen de diferentes IPs.

Cuando cualquiera de los límites es superado, el endpoint responde:

```json
{
  "error": "Too many requests"
}
```

con estado HTTP `429 Too Many Requests`.

------------------------------------------------------------------------

## Responsabilidades

### Controller

\-   Validar el cuerpo de la solicitud.

\-   Obtener la IP del cliente.

\-   Validar que la IP pueda ser identificada.

\-   Aplicar el rate limit por IP.

\-   Aplicar el rate limit por token.

\-   Delegar el cambio de contraseña al `authService`.

\-   Enviar el correo de confirmación.

\-   Devolver la respuesta HTTP.

\-   Delegar el manejo de errores al `errorHandler`.

### AuthService

El servicio es responsable de:

\-   Validar el token recibido.

\-   Verificar que el usuario asociado exista.

\-   Verificar que la cuenta se encuentre activa.

\-   Generar el hash de la nueva contraseña.

\-   Actualizar la contraseña del usuario.

\-   Eliminar el token de recuperación para impedir su reutilización.

\-   Devolver el email del usuario para el envío de la notificación.

### MailService

Envía un correo electrónico informando que la contraseña fue actualizada

correctamente.

------------------------------------------------------------------------

## Respuesta exitosa

```http
HTTP/1.1 200 OK
```

```json
{
    "ok": true
}
```

------------------------------------------------------------------------

## Errores

El endpoint delega el manejo de errores al `errorHandler`.

Entre los posibles escenarios se encuentran:

\-   Error de validación de los datos enviados.

\-   Token inexistente.

\-   Token inválido.

\-   Token expirado.

\-   Usuario inexistente.

\-   Cuenta inactiva.

\-   IP no identificable.

\-   Límite de solicitudes por IP superado (`429 Too Many Requests`).

\-   Límite de solicitudes por token superado (`429 Too Many Requests`).

------------------------------------------------------------------------

## Consideraciones de seguridad

\-   La nueva contraseña nunca se almacena en texto plano.

\-   Antes de persistirse se genera un hash utilizando `bcrypt`.

\-   El token de recuperación se elimina inmediatamente después del

    cambio de contraseña.

\-   Cada token puede utilizarse una única vez.

\-   El usuario recibe un correo electrónico notificando el cambio de

    contraseña como medida adicional de seguridad.

\-   Se limita la cantidad de solicitudes por IP mediante rate limiting.

\-   Se limita la cantidad de solicitudes asociadas al mismo token mediante rate limiting.

\-   Las solicitudes que superan cualquiera de los límites son rechazadas con `429 Too Many Requests`.

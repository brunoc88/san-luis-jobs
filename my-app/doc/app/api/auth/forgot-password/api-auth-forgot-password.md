# Documentación - POST `/api/auth/forgot-password`

## Objetivo

Este endpoint inicia el flujo de recuperación de contraseña. Si el
correo pertenece a un usuario activo y no existe una solicitud vigente,
se genera un token y se envía un email con el enlace de recuperación.

Por motivos de seguridad, cuando la solicitud es válida se responde
`200 OK` independientemente de si el usuario existe.

## Flujo

1.  Validar el body con `passwordRecoverySchema`.
2.  Si la validación falla, devolver el error.
3.  Ejecutar `authService.requestPasswordRecovery()`.
4.  Si el servicio devuelve datos, enviar el email mediante
    `mailService.sendEmailPasswordRecovery()`.
5.  Responder `200 OK`.

## Responsabilidades

### Controller

-   Validar el request.
-   Delegar la lógica al `authService`.
-   Enviar el email.
-   Responder al cliente.

### AuthService

-   Buscar el usuario.
-   Verificar que exista y esté activo.
-   Verificar que no exista un token vigente.
-   Generar el token y su hash.
-   Guardar únicamente el hash.
-   Devolver el token original y el email.

### MailService

-   Construir el enlace de recuperación.
-   Enviar el email con el token.

## Seguridad

-   No revelar si el usuario existe.
-   No revelar si la cuenta está inactiva.
-   No revelar si existe una solicitud pendiente.
-   Guardar únicamente el hash del token.
-   Enviar únicamente el token original por email.

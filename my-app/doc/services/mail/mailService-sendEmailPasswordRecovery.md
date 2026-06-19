# Documentación - `mailService.sendEmailPasswordRecovery()`

## Objetivo

Enviar al usuario un correo electrónico con el enlace para restablecer
su contraseña.

El enlace contiene el token de recuperación generado previamente por el
`authService`, permitiendo que el usuario continúe con el flujo de
recuperación.

------------------------------------------------------------------------

## Flujo de ejecución

1.  Recibir el email del usuario y el token de recuperación.
2.  Construir la URL utilizando `FRONT_URL` y el token como parámetro de
    consulta.
3.  Generar el contenido del correo.
4.  Enviar el email mediante el `transporter` de Nodemailer.

------------------------------------------------------------------------

## Parámetros

### `email`

Dirección de correo del destinatario.

### `token`

Token original generado por `generateToken()`.

Este valor nunca se almacena en la base de datos y únicamente se utiliza
para construir el enlace enviado al usuario.

------------------------------------------------------------------------

## Enlace generado

El correo contiene un enlace con el siguiente formato:

``` text
{FRONT_URL}/reset-password?token=<token>
```

Al acceder a esta URL, el frontend podrá validar el token llamando al
endpoint:

``` text
GET /api/auth/reset-password
```

------------------------------------------------------------------------

## Responsabilidades

-   Construir el enlace de recuperación.
-   Generar el contenido del correo electrónico.
-   Enviar el email utilizando Nodemailer.

No realiza validaciones ni lógica de negocio.

------------------------------------------------------------------------

## Consideraciones de seguridad

-   El token se envía únicamente al correo asociado al usuario.
-   La URL base proviene de la variable de entorno `FRONT_URL`.
-   El servicio no genera ni valida tokens; únicamente los distribuye.
-   El token enviado será validado posteriormente por el backend antes
    de permitir el cambio de contraseña.

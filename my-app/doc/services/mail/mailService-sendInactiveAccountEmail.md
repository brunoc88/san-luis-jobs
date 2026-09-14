# Documentación - `sendInactiveAccountEmail`

## Objetivo

Este método del `MailService` envía un email al usuario cuando intenta solicitar la recuperación de contraseña, pero su cuenta se encuentra inactiva.

El mensaje informa que la recuperación de contraseña no puede solicitarse mientras la cuenta permanezca inactiva y le indica que debe comunicarse con el equipo de soporte para solicitar su activación.

## Firma

```ts
sendInactiveAccountEmail: (email: string) => ...
```

## Parámetros

### `email`

- Tipo: `string`
- Email del usuario al que se enviará la notificación.

## Funcionamiento

El método utiliza `transporter.sendMail()` para enviar el correo.

El email contiene:

- Remitente: `Soporte <no-reply@app.com>`
- Destinatario: email recibido como parámetro.
- Asunto: `No podés recuperar tu contraseña`
- Mensaje indicando:
  - que se recibió una solicitud de recuperación;
  - que la cuenta está inactiva;
  - que no puede solicitar la recuperación de contraseña;
  - que debe comunicarse con soporte para solicitar la activación.

## Flujo dentro de la aplicación

Este método es utilizado por el controller de recuperación de contraseña cuando el `authService.requestPasswordRecovery()` devuelve:

```ts
{
    email,
    result: "inactive"
}
```

El controller ejecuta:

```ts
await mailService.sendInactiveAccountEmail(res.email)
```

No se genera ni se envía un token de recuperación para este caso.

## Responsabilidad

La responsabilidad del método es exclusivamente construir y enviar la notificación correspondiente a una cuenta inactiva.

No determina si la cuenta está inactiva, no modifica datos de la base de datos y no genera tokens.

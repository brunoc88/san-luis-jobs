# `sendAdminRoleRevokedEmail` — Mail Service

## Descripción

`sendAdminRoleRevokedEmail` envía un correo electrónico al usuario cuando se le revoca correctamente el rol de administrador.

El método utiliza el `transporter` configurado con Nodemailer para realizar el envío mediante el servidor SMTP.

## Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `email` | `string` | Dirección de correo electrónico del usuario al que se le revocó el rol de administrador. |

## Configuración del correo

| Propiedad | Valor |
|---|---|
| `from` | `"Soporte" <no-reply@app.com>` |
| `to` | Email recibido como parámetro |
| `subject` | `Rol de administrador revocado` |
| `html` | Contenido HTML de la notificación |

## Contenido de la notificación

El correo informa al usuario que:

- su rol de administrador fue revocado correctamente;
- su cuenta vuelve a contar con los permisos correspondientes a un usuario común;
- puede comunicarse con el equipo de soporte si considera que la modificación se realizó por error.

El mensaje finaliza con una despedida del equipo de soporte.

## Funcionamiento

El método delega el envío directamente a:

`transporter.sendMail()`

Al retornar el resultado de `sendMail()`, el método permite que el código que lo invoca pueda esperar y gestionar el resultado o error producido durante el envío.

## Responsabilidad

Este método tiene una única responsabilidad:

> Notificar por correo electrónico al usuario que su rol de administrador fue revocado.

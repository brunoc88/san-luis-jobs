# `sendAdminRoleGrantedEmail` — Mail Service

## Descripción

`sendAdminRoleGrantedEmail` envía un correo electrónico al usuario cuando se le otorga correctamente el rol de administrador.

El método utiliza el `transporter` configurado con Nodemailer para realizar el envío mediante el servidor SMTP.

## Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `email` | `string` | Dirección de correo electrónico del usuario que recibió el rol de administrador. |

## Configuración del correo

| Propiedad | Valor |
|---|---|
| `from` | `"Soporte" <no-reply@app.com>` |
| `to` | Email recibido como parámetro |
| `subject` | `Rol de administrador otorgado` |
| `html` | Contenido HTML de la notificación |

## Contenido de la notificación

El correo informa al usuario que:

- recibió correctamente el rol de administrador;
- a partir de ese momento cuenta con los permisos correspondientes al rol;
- debe utilizar dichos permisos de manera responsable y respetar las normas de la plataforma.

El mensaje finaliza con una despedida del equipo de soporte.

## Funcionamiento

El método delega el envío directamente a:

`transporter.sendMail()`

Al retornar el resultado de `sendMail()`, el método permite que el código que lo invoca pueda esperar y gestionar el resultado o error producido durante el envío.

## Responsabilidad

Este método tiene una única responsabilidad:

> Notificar por correo electrónico al usuario que su rol de administrador fue otorgado.

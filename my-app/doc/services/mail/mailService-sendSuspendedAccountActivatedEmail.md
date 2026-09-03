# MailService — sendSuspendedAccountActivatedEmail

## Descripción

El método `sendSuspendedAccountActivatedEmail` envía un correo electrónico al usuario cuya cuenta fue reactivada después de una suspensión.

## Funcionamiento

El método recibe el email del usuario y utiliza el `transporter` configurado con Nodemailer para enviar el mensaje.

### Parámetros

- `email`: dirección de correo electrónico del usuario que recibirá la notificación.

### Configuración del correo

- **Remitente:** `Soporte <no-reply@app.com>`
- **Destinatario:** email recibido como parámetro.
- **Asunto:** `Cuenta reactivada`

### Contenido

El correo informa al usuario que:

- Su cuenta fue reactivada correctamente.
- Las suspensiones asociadas a su cuenta fueron levantadas.
- Puede volver a utilizar la plataforma con normalidad.
- Debe respetar las normas de la plataforma para evitar nuevas sanciones.

El mensaje finaliza con una despedida del equipo de soporte.

## Responsabilidad

Este método se encarga exclusivamente de construir y enviar el correo de notificación correspondiente a la reactivación de una cuenta suspendida.

No contiene lógica de autorización ni reglas de negocio relacionadas con la suspensión o reactivación de cuentas.

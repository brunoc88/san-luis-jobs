# sendAccountActivatedEmail — Mail Service

## Descripción

`sendAccountActivatedEmail` envía una notificación por correo electrónico al usuario cuya cuenta fue activada correctamente.

El método utiliza el `transporter` configurado con Nodemailer para realizar el envío.

---

## Implementación

```ts id="f3m8qa"
sendAccountActivatedEmail: (email: string) => {

    return transporter.sendMail({

        from: '"Soporte" <no-reply@app.com>',

        to: email,

        subject: 'Cuenta activada',

        html: `
            <h2>Tu cuenta ha sido reactivada</h2>

            <p>
                Te informamos que tu cuenta ha sido activada correctamente.
            </p>

            <p>
                Ya podés volver a utilizar la plataforma con normalidad.
            </p>

            <p>
                Si no solicitaste esta reactivación o considerás que se realizó
                por error, podés comunicarte con el equipo de soporte.
            </p>

            <p>
                Saludos,<br>
                Equipo de Soporte
            </p>
        `
    })
}
```

## Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `email` | `string` | Dirección de correo del usuario que fue activado. |

## Funcionamiento

El método configura el mensaje mediante `transporter.sendMail()`:

- **`from`**: dirección desde la que se envía el correo.
- **`to`**: dirección del usuario que recibió la activación.
- **`subject`**: asunto del correo: `Cuenta activada`.
- **`html`**: contenido HTML del mensaje.

El método retorna directamente la `Promise` generada por `transporter.sendMail()`, permitiendo que el controller espere la finalización del envío mediante `await`.

## Responsabilidad

Este método pertenece exclusivamente a la capa de **Mail Service**.

Su responsabilidad es enviar la notificación. No contiene lógica relacionada con:

- permisos administrativos;
- validación del usuario;
- estado de la cuenta;
- modificación de la base de datos;
- reglas de activación.

La decisión de cuándo debe enviarse el correo pertenece al flujo que ejecuta la activación, mientras que este método únicamente se encarga de realizar el envío.
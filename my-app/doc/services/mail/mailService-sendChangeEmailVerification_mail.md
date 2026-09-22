# sendChangeEmailVerification — Mail Service

## Propósito

Envía al nuevo email el enlace para confirmar el cambio.

## Parámetros

- `email`: nuevo email solicitado.
- `token`: token plano generado para la verificación.

```ts
sendChangeEmailVerification: async (email: string, token: string) => {
    const verificationUrl =
        `${process.env.NEXT_PUBLIC_APP_URL}/api/users/me/email/verify?token=${token}`

    await transporter.sendMail({
        from: 'Soporte <no-reply@app.com>',
        to: email,
        subject: 'Confirmación de cambio de email',
        html: `...`
    })
}
```

El token plano se incluye en el enlace; el hash nunca se envía por correo. El envío es asíncrono y se llama con `await`.

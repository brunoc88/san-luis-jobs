# PATCH /api/users/me/email — Controller

## Propósito

Solicita el cambio del email de la cuenta autenticada.

## Flujo

1. Obtiene el `userId` mediante `requireSession()`.
2. Valida el body con `changeEmailSchema`.
3. Llama a `userService.requestChangeEmail()`.
4. Recibe el token plano generado por el service.
5. Envía el correo de verificación al nuevo email mediante `mailService`.
6. Devuelve `200` cuando el proceso se completa.

## Responsabilidad

El controller coordina la petición HTTP. No genera tokens, no modifica directamente la base de datos y no realiza la lógica de negocio del cambio de email.

## Código

```ts
export const PATCH = async (req: Request) => {
    try {
        const userId = await requireSession()
        const validate = await validateRequest(req, changeEmailSchema)
        if (!validate?.ok) {
            return NextResponse.json({ error: validate?.error }, { status: validate.status })
        }
        const email = validate.data?.email
        const { token } = await userService.requestChangeEmail(userId, email)
        await mailService.sendChangeEmailVerification(email, token)
        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
```

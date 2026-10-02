# PATCH /api/users/me/email — Controller

## Propósito

Solicita el cambio del email de la cuenta autenticada.

## Rate Limit

El endpoint aplica dos límites independientes.

### Rate Limit por usuario

- **Límite:** 5 solicitudes por hora.
- **Identificador:** `userId`.
- **Key:** `change-email:user:${userId}`.
- **Configuración:** `rateLimitConfig.changeEmail.user`.

Si se supera el límite, responde con:

**429 Too Many Requests**

```json
{
  "error": "Too many requests"
}
```

### Rate Limit por email

También se aplica un límite específico al nuevo email solicitado.

Límite: 3 solicitudes cada 15 minutos.
Identificador: email.
Key: change-email:email:${email}.
Configuración: rateLimitConfig.changeEmail.email.

Si se supera el límite, responde con:

**429 Too Many Requests**

```json
{
  "error": "Too many requests"
}
```

El rate limit por email se aplica después de validar el body y antes de ejecutar la lógica de negocio.

Este límite protege específicamente la generación y el envío de solicitudes de verificación hacia una misma dirección de email.

## Flujo

1. Obtiene el `userId` mediante `requireSession()`.
2. Valida el body con `changeEmailSchema`.
3. Aplica el rate limit por `userId`.
4. Obtiene el nuevo `email` del body validado.
5. Aplica el rate limit por `email`.
6. Llama a `userService.requestChangeEmail()`.
7. Recibe el token plano generado por el service.
8. Envía el correo de verificación al nuevo email mediante `mailService`.
9. Devuelve **200** cuando el proceso se completa.
10. Si ocurre un error, lo delega a `errorHandler()`.

## Responsabilidad

El controller coordina la petición HTTP.

Es responsable de:

- Obtener la sesión.
- Validar el body.
- Aplicar el rate limit por usuario.
- Aplicar el rate limit por email.
- Delegar la operación al service.
- Pasar el token al `mailService`.
- Devolver la respuesta HTTP.
- Delegar los errores al `errorHandler`.

No genera tokens, no modifica directamente la base de datos y no realiza la lógica de negocio del cambio de email.

## Código

```ts
export const PATCH = async (req: Request) => {
    try {
        const userId = await requireSession()

        const validate = await validateRequest(
            req,
            changeEmailSchema
        )

        if (!validate?.ok) {
            return NextResponse.json(
                { error: validate?.error },
                { status: validate.status }
            )
        }

        const allowedByUserId = rateLimiter(
            `change-email:user:${userId}`,
            rateLimitConfig.changeEmail.user.limit,
            rateLimitConfig.changeEmail.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const email = validate.data?.email

        const allowedByEmail = rateLimiter(
            `change-email:email:${email}`,
            rateLimitConfig.changeEmail.email.limit,
            rateLimitConfig.changeEmail.email.windowMs
        )

        if (!allowedByEmail) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const { token } =
            await userService.requestChangeEmail(
                userId,
                email
            )

        await mailService.sendChangeEmailVerification(
            email,
            token
        )

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
```

## Posibles errores

| Status | Descripción |
|----------|-------------|
| 400 | Body inválido |
| 401 | No existe una sesión válida |
| 403 | Usuario inactivo o solicitud no permitida |
| 409 | El email ya está en uso|
| 429 | Se superó el límite de solicitudes |
| 500 | Error interno del servidor |
---

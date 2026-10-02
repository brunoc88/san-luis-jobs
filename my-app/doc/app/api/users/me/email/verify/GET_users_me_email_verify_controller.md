# GET /api/users/me/email/verify — Controller

## Propósito

Confirma el cambio de email mediante el token recibido por correo.

## Autenticación

No utiliza `requireSession()` ni `getOptionalSessionUser()`. El token del correo funciona como credencial, por lo que el usuario puede confirmar el cambio aunque su sesión haya sido cerrada.

## Rate limiting

El endpoint utiliza dos límites independientes:

### Por IP

- **Límite:** 10 solicitudes
- **Ventana:** 1 minuto
- **Key:** `change-email-verify:ip:${clientIp}`
- **Configuración:** `rateLimitConfig.changeEmailVerify.ip`

### Por token

- **Límite:** 3 solicitudes
- **Ventana:** 15 minutos
- **Key:** `change-email-verify:token:${validate.token}`
- **Configuración:** `rateLimitConfig.changeEmailVerify.token`

Si alguno de los límites no permite la solicitud, responde con `429 Too Many Requests`.

## Flujo

1. Obtiene el parámetro `token`.
2. Valida el token mediante `requireToken()`.
3. Obtiene la IP del cliente.
4. Aplica el rate limit por IP.
5. Aplica el rate limit por token.
6. Ejecuta `userService.changeEmailConfirm()`.
7. Retorna una respuesta exitosa.

## Código

```ts
export const GET = async (req: NextRequest) => {
    try {
        const searchParams = req.nextUrl.searchParams
        const token = searchParams.get("token")

        const validate = await requireToken(token)

        const clientIp = getClientIp(req.headers)

        if (!clientIp) {
            return NextResponse.json(
                { error: "Unable to identify client" },
                { status: 400 }
            )
        }

        const allowedByIp = rateLimiter(
            `change-email-verify:ip:${clientIp}`,
            rateLimitConfig.changeEmailVerify.ip.limit,
            rateLimitConfig.changeEmailVerify.ip.windowMs
        )

        if (!allowedByIp) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        const allowedByToken = rateLimiter(
            `change-email-verify:token:${validate.token}`,
            rateLimitConfig.changeEmailVerify.token.limit,
            rateLimitConfig.changeEmailVerify.token.windowMs
        )

        if (!allowedByToken) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await userService.changeEmailConfirm(validate.token)

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
```

Ruta: `GET /api/users/me/email/verify?token=...`

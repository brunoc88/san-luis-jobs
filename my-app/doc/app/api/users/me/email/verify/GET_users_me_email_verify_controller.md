# GET /api/users/me/email/verify — Controller

## Propósito

Confirma el cambio de email mediante el token recibido por correo.

## Autenticación

No utiliza `requireSession()` ni `getOptionalSessionUser()`. El token del correo funciona como credencial, por lo que el usuario puede confirmar el cambio aunque su sesión haya sido cerrada.

## Código

```ts
export const GET = async (req: NextRequest) => {
    try {
        const searchParams = req.nextUrl.searchParams
        const token = searchParams.get("token")
        const validate = await requireToken(token)
        await userService.changeEmailConfirm(validate.token)
        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}
```

Ruta: `GET /api/users/me/email/verify?token=...`

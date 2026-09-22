# requestChangeEmail — Service

## Propósito

Inicia el proceso de cambio de email sin modificar todavía el email definitivo.

## Flujo

1. Verifica que el usuario esté activo.
2. Obtiene sus datos.
3. Rechaza si el nuevo email es igual al actual.
4. Comprueba si el email ya está utilizado.
5. Elimina un token pendiente anterior, si existe.
6. Genera un token aleatorio.
7. Guarda solamente el hash del token.
8. Establece una expiración de 24 horas.
9. Guarda el nuevo email en `pendingEmail`.
10. Devuelve el token plano para enviarlo por correo.

```ts
requestChangeEmail: async (id: number, email: string) => {
    const user = await requireActiveUserById(id)
    const userData = await userRepo.findById(id)
    if (!userData) throw new NotFoundError()
    if (userData.email === email) throw new ForbiddenError('El email es el mismo')
    const emailInUse = await userRepo.findByEmail(email)
    if (emailInUse) throw new ConflictError('email no disponible')

    const verificationToken = await verificationTokenRepo.findTokenByUserId(id)
    if (verificationToken) await verificationTokenRepo.delete(verificationToken.token)

    const token = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await verificationTokenRepo.create({ token: tokenHash, userId: user.id, expiresAt })
    await userRepo.savePendingEmail(user.id, email)
    return { token }
}
```

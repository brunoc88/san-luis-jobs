# changeEmailConfirm — Service

## Propósito

Finaliza el cambio de email después de validar el token.

## Flujo

1. Busca el token.
2. Obtiene el usuario asociado.
3. Comprueba que exista `pendingEmail`.
4. Actualiza el email definitivo.
5. Elimina el token utilizado.

```ts
changeEmailConfirm: async (token: string) => {
    const tokenData = await verificationTokenRepo.findByToken(token)
    if (!tokenData) throw new NotFoundError()
    const userData = await userRepo.findById(tokenData.userId)
    if (!userData) throw new NotFoundError()
    if (!userData.pendingEmail) throw new ForbiddenError('No existe mail sustito')
    await userRepo.changeEmailById(userData.id, userData.pendingEmail)
    await verificationTokenRepo.delete(tokenData.token)
}
```

No requiere sesión: el token identifica al usuario y autoriza la confirmación.

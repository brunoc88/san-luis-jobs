# changeEmailById — User Repository

Realiza el cambio definitivo del email y limpia `pendingEmail`.

```ts
changeEmailById: async (id: number, email: string) => {
    await prisma.user.update({
        data: { email, pendingEmail: null },
        where: { id }
    })
}
```

Antes: `email = viejo@gmail.com`, `pendingEmail = nuevo@gmail.com`.
Después: `email = nuevo@gmail.com`, `pendingEmail = null`.

El `@unique` de `User.email` continúa siendo la garantía definitiva contra duplicados.

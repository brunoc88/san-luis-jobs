# savePendingEmail — User Repository

Guarda temporalmente el nuevo email mientras espera la confirmación.

```ts
savePendingEmail: async (id: number, email: string) => {
    await prisma.user.update({ data: { pendingEmail: email }, where: { id } })
}
```

No reemplaza todavía a `User.email`. Ejemplo: `email = viejo@gmail.com`, `pendingEmail = nuevo@gmail.com`.

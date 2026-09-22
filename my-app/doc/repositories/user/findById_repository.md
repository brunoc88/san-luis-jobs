# findById — User Repository

Obtiene un usuario por ID.

```ts
findById: async (id: number): Promise<User | null> =>
    await prisma.user.findUnique({ where: { id } })
```


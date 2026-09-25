# Documentación — `warningRepo.count`

## Responsabilidad

Cuenta la cantidad de advertencias asociadas a un usuario.

## Parámetros

- `id`: identificador del usuario.

## Retorno

Retorna un `number` con la cantidad de advertencias encontradas para ese usuario.

Si el usuario no tiene advertencias, retorna `0`.

## Persistencia

Utiliza `prisma.warning.count()` filtrando por `userId`:

```ts
await prisma.warning.count({
    where: { userId: id }
})
```

## Código actual

```ts
count: async (id: number): Promise<number> =>
    await prisma.warning.count({
        where: { userId: id }
    })
```

## Nota

El método solamente realiza el conteo. No modifica ni devuelve los registros de advertencias.

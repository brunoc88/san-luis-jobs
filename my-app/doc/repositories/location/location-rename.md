# Documentación — `locationRepo.renameLocation`

## Responsabilidad

Modifica el nombre de una ubicación existente.

## Parámetros

- `id`: identificador de la ubicación.
- `name`: nuevo nombre de la ubicación.

## Retorno

Retorna la entidad `Location` actualizada.

## Persistencia

Actualiza únicamente el campo `name`:

```ts
await prisma.location.update({
    data: { name },
    where: { id }
})
```

## Código actual

```ts
renameLocation: async (
    id: number,
    name: string
): Promise<Location> =>
    await prisma.location.update({
        data: { name },
        where: { id }
    })
```

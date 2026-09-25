# Documentación — `locationRepo.activateLocation`

## Responsabilidad

Activa una ubicación existente.

## Parámetros

- `id`: identificador de la ubicación.

## Retorno

Retorna la entidad `Location` actualizada.

## Persistencia

Actualiza el campo `isActive` a `true`:

```ts
await prisma.location.update({
    data: { isActive: true },
    where: { id }
})
```

## Código actual

```ts
activateLocation: async (id: number): Promise<Location> =>
    await prisma.location.update({
        data: { isActive: true },
        where: { id }
    })
```

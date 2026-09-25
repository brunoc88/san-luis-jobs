# Documentación — `locationRepo.deactivateLocation`

## Responsabilidad

Desactiva una ubicación existente.

## Parámetros

- `id`: identificador de la ubicación.

## Retorno

Retorna la entidad `Location` actualizada.

## Persistencia

Actualiza el campo `isActive` a `false`:

```ts
await prisma.location.update({
    data: { isActive: false },
    where: { id }
})
```

## Código actual

```ts
deactivateLocation: async (id: number): Promise<Location> =>
    await prisma.location.update({
        data: { isActive: false },
        where: { id }
    })
```

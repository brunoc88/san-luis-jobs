# Documentación — `locationRepo.findLocationById`

## Responsabilidad

Busca una ubicación específica mediante su identificador.

## Parámetros

- `id`: identificador de la ubicación.

## Retorno

Retorna:

- `Location` si encuentra una ubicación con ese `id`.
- `null` si no existe.

## Persistencia

Utiliza `findUnique` sobre el campo `id`:

```ts
await prisma.location.findUnique({
    where: { id }
})
```

## Código actual

```ts
findLocationById: async (id: number): Promise<Location | null> =>
    await prisma.location.findUnique({
        where: { id }
    })
```

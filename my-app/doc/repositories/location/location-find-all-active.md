# Documentación — `locationRepo.findAllActiveLocations`

## Responsabilidad

Obtiene todas las ubicaciones que se encuentran activas.

## Parámetros

No recibe parámetros.

## Retorno

Retorna las ubicaciones cuyo campo `isActive` es `true`.

Si no existen ubicaciones activas, retorna un arreglo vacío.

## Persistencia

Utiliza `findMany` con un filtro por `isActive`:

```ts
await prisma.location.findMany({
    where: { isActive: true }
})
```

## Código actual

```ts
findAllActiveLocations: async () =>
    await prisma.location.findMany({
        where: { isActive: true }
    })
```

# Documentación — `locationRepo.findAllLocations`

## Responsabilidad

Obtiene todas las ubicaciones almacenadas en la base de datos.

## Parámetros

No recibe parámetros.

## Retorno

Retorna un arreglo de entidades `Location`.

Si no existen ubicaciones, retorna un arreglo vacío.

## Persistencia

Utiliza:

```ts
await prisma.location.findMany()
```

No aplica filtros.

## Código actual

```ts
findAllLocations: async (): Promise<Location[]> =>
    await prisma.location.findMany()
```

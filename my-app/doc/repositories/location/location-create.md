# Documentación — `locationRepo.create`

## Responsabilidad

Crea una nueva ubicación en la base de datos.

## Parámetros

- `location`: nombre de la ubicación que se desea crear.

## Retorno

Retorna la entidad `Location` creada.

## Persistencia

Utiliza `prisma.location.create()` y guarda el nombre recibido:

```ts
await prisma.location.create({
    data: { name: location }
})
```

## Código actual

```ts
create: async (location: string): Promise<Location> =>
    await prisma.location.create({
        data: { name: location }
    })
```

## Nota

El repository no realiza validaciones adicionales sobre el nombre. Las validaciones de negocio corresponden a las capas superiores.

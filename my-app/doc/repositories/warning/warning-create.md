# Documentación — `warningRepo.create`

## Responsabilidad

Crea una nueva advertencia (`Warning`) en la base de datos.

## Parámetros

- `data`: objeto `WarningCreate` con los datos necesarios para crear la advertencia.

## Retorno

Retorna la entidad `Warning` creada.

## Persistencia

Utiliza `prisma.warning.create()` y pasa directamente los datos recibidos:

```ts
await prisma.warning.create({ data })
```

## Código actual

```ts
create: async (data: WarningCreate): Promise<Warning> =>
    await prisma.warning.create({ data })
```

## Nota

El repository no realiza validaciones adicionales ni transforma los datos. Recibe el objeto ya preparado por las capas superiores y lo utiliza para la creación del registro.

# getAllActiveComplaints

## Objetivo

El service `getAllActiveComplaints` se encarga de autorizar al usuario y aplicar la paginación al listado de quejas activas.

La estrategia de paginación es la misma utilizada para los feedbacks.

## Autorización

Antes de consultar las quejas:

1. Se comprueba que el usuario exista y esté activo mediante `requireActiveUserById`.
2. Se comprueba que tenga permisos de administrador mediante `requireAdmin`.

La consulta solamente se realiza después de superar ambas comprobaciones.

## Límite por página

Se establece un límite de:

```text
limit = 5
```

Esto significa que como máximo se devuelven **5 quejas por página**.

## `take`

Para determinar si existe una página siguiente se solicita un registro adicional:

```text
take = limit + 1
```

Como el límite es 5, el repository solicita hasta 6 registros.

El registro adicional no se devuelve al cliente; solamente se utiliza para determinar si existe otra página.

## `skip`

La cantidad de registros que se deben omitir se calcula mediante:

```text
skip = (page - 1) × limit
```

Por ejemplo:

| Página | Skip |
|---:|---:|
| 1 | 0 |
| 2 | 5 |
| 3 | 10 |

## `hasNextPage`

Se determina comparando la cantidad de registros obtenidos con el límite:

```text
hasNextPage = complaints.length > limit
```

Si se obtienen 6 registros, significa que existe al menos un registro más allá de los 5 que corresponden a la página actual.

Si se obtienen 5 o menos, no existe una página siguiente.

## Eliminación del registro adicional

Cuando existen más registros que el límite, se conservan solamente los primeros 5 antes de construir la respuesta.

De esta forma:

```text
6 obtenidos → 5 devueltos + hasNextPage = true
```

Mientras que:

```text
5 obtenidos → 5 devueltos + hasNextPage = false
```

Y:

```text
menos de 5 obtenidos → todos devueltos + hasNextPage = false
```

## Transformación de datos

Antes de devolver los resultados, el service transforma cada queja al formato utilizado por la API.

Se exponen:

- `id`
- `createdAt` como `date`
- `username` del usuario como `user`
- `reason`

No se devuelve directamente el objeto completo obtenido desde Prisma.

## Resultado

El service devuelve:

```text
{
  complaints,
  hasNextPage
}
```

La respuesta contiene únicamente los registros correspondientes a la página solicitada y la información necesaria para determinar si existe una página posterior.

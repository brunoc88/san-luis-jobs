# Paginación en el Service — `getAllFeedbacks`

El service recibe el `userId` y la página solicitada (`page`) y se encarga de aplicar la lógica de autorización y paginación.

## 1. Autorización

Antes de consultar los feedbacks:

- Se comprueba que el usuario siga existiendo y esté activo.
- Se comprueba que tenga rol de administrador.

Esto mantiene las reglas de autorización dentro de la capa de service.

## 2. `limit`

Se establece:

```ts
const limit = 5
```

`limit` representa la cantidad máxima de feedbacks que se devolverán al cliente por página.

En este caso:

**5 feedbacks por página.**

## 3. `take`

Se utiliza:

```ts
const take = limit + 1
```

Como `limit` es 5, `take` es 6.

El motivo es poder determinar si existe una página siguiente sin tener que obtener todos los registros ni realizar una consulta adicional solamente para contarlos.

Se solicita un registro adicional:

- si se obtienen 6 registros, existe una página siguiente;
- si se obtienen 5 o menos, no existe una página siguiente.

El sexto registro se utiliza únicamente para determinar `hasNextPage` y no se devuelve al cliente.

## 4. `skip`

Se calcula mediante:

```ts
const skip = (page - 1) * limit
```

Esto determina cuántos registros deben omitirse antes de obtener los correspondientes a la página solicitada.

Ejemplos:

| Página | Skip |
|---:|---:|
| 1 | 0 |
| 2 | 5 |
| 3 | 10 |
| 4 | 15 |

La fórmula permite mantener siempre 5 registros por página.

## 5. Consulta al Repository

El service envía `take` y `skip` al repository.

De esta manera, la base de datos obtiene solamente los registros necesarios para esa página, en lugar de recuperar todos los feedbacks.

## 6. `hasNextPage`

Se determina mediante:

```ts
const hasNextPage = feedbacks.length > limit
```

Si la consulta devuelve más registros que el límite de la página, significa que existe al menos un registro adicional y, por lo tanto, otra página.

## 7. Eliminar el registro adicional

Cuando existe una página siguiente, el registro adicional se elimina antes de construir la respuesta:

```ts
const feedbacksToReturn = hasNextPage
    ? feedbacks.slice(0, limit)
    : feedbacks
```

Por ejemplo, si el repository devuelve 6 registros:

```text
1 2 3 4 5 6
```

el cliente recibe:

```text
1 2 3 4 5
```

El sexto registro solamente sirvió para determinar que:

```text
hasNextPage = true
```

## 8. Transformación de los datos

Antes de devolver los resultados, el service transforma los registros de Prisma al formato que necesita la API.

Se seleccionan solamente:

- `id`
- `createdAt` como `date`
- `username` del usuario como `user`
- `opinion`

Esto permite que la respuesta de la API no exponga directamente el objeto completo obtenido de la base de datos.

## Resultado del Service

El service devuelve:

```ts
{
    feedbacks: feedbacksData,
    hasNextPage
}
```

El resultado contiene únicamente los 5 registros correspondientes a la página solicitada (o menos si es la última página) y la información necesaria para saber si existe una página siguiente.




# getAllSuspendedAccounts — Service

## Descripción

`getAllSuspendedAccounts` obtiene un listado paginado de cuentas suspendidas.

La operación está restringida a usuarios con rol `superAdmin` activos.

El método permite realizar una búsqueda opcional por prefijo de `username` o `email` y devuelve como máximo **5 cuentas por página**, junto con un indicador que permite determinar si existe una página siguiente.

---

## Implementación

```ts
getAllSuspendedAccounts: async (
    userId: number,
    page: number,
    search?: string
) => {

    const user = await requireActiveUserById(userId)

    if (user.role !== 'superAdmin') {
        throw new ForbiddenError()
    }

    const limit = 5
    const skip = (page - 1) * limit
    const take = limit + 1

    const where: Prisma.UserWhereInput = {
        isActive: false,
        isSuspended: true,
        role: {
            not: UserRole.superAdmin
        }
    }

    if (search) {
        where.OR = [
            {
                username: {
                    startsWith: search,
                    mode: 'insensitive'
                }
            },
            {
                email: {
                    startsWith: search,
                    mode: 'insensitive'
                }
            }
        ]
    }

    const suspendedAccounts =
        await adminRepo.findAllSuspendedAccounts(
            where,
            skip,
            take
        )

    const hasNextPage = suspendedAccounts.length > limit

    const accountsToReturn = hasNextPage
        ? suspendedAccounts.slice(0, limit)
        : suspendedAccounts

    return {
        accounts: accountsToReturn.map(a => ({
            id: a.id,
            username: a.username,
            email: a.email,
            pic: a.pic
        })),
        hasNextPage
    }
}
```

---

## Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `userId` | `number` | Sí | ID del usuario que realiza la consulta. |
| `page` | `number` | Sí | Página solicitada. |
| `search` | `string` | No | Texto utilizado para buscar por prefijo de username o email. |

---

## Reglas de autorización

Primero se obtiene el usuario solicitante mediante:

```ts
const user = await requireActiveUserById(userId)
```

Esto garantiza que el usuario exista y se encuentre activo.

Posteriormente se verifica su rol:

```ts
if (user.role !== 'superAdmin') {
    throw new ForbiddenError()
}
```

Solamente un `superAdmin` puede consultar el listado de cuentas suspendidas.

---

## Filtro de cuentas suspendidas

La consulta utiliza las siguientes condiciones:

```ts
const where: Prisma.UserWhereInput = {
    isActive: false,
    isSuspended: true,
    role: {
        not: UserRole.superAdmin
    }
}
```

Esto garantiza que:

- la cuenta esté inactiva;
- la cuenta esté marcada como suspendida;
- las cuentas con rol `superAdmin` sean excluidas del listado.

El estado `isSuspended` representa específicamente una suspensión, mientras que `isActive: false` refleja que la cuenta no puede utilizar la plataforma.

---

## Búsqueda

Si se proporciona `search`, se agrega un filtro `OR` para buscar por username o email:

```ts
where.OR = [
    {
        username: {
            startsWith: search,
            mode: 'insensitive'
        }
    },
    {
        email: {
            startsWith: search,
            mode: 'insensitive'
        }
    }
]
```

La búsqueda utiliza `startsWith`, por lo que funciona como una búsqueda incremental por prefijo.

Por ejemplo:

```text
search=c
```

puede encontrar:

```text
common1
common2
```

y:

```text
search=comm
```

puede encontrar:

```text
common1
common2
common3
```

`mode: 'insensitive'` permite que la búsqueda no distinga entre mayúsculas y minúsculas.

---

## Paginación

El servicio utiliza un límite fijo de **5 cuentas por página**:

```ts
const limit = 5
```

El desplazamiento se calcula mediante:

```ts
const skip = (page - 1) * limit
```

Ejemplo:

| Página | `skip` | Registros |
|---:|---:|---|
| 1 | 0 | 1-5 |
| 2 | 5 | 6-10 |
| 3 | 10 | 11-15 |

El cliente no controla el `limit`; siempre se utilizan 5 registros por página.

---

## Detección de página siguiente

Para determinar si existen más resultados, el servicio solicita un registro adicional:

```ts
const take = limit + 1
```

Como `limit` es 5, la consulta puede devolver hasta 6 registros.

Luego:

```ts
const hasNextPage = suspendedAccounts.length > limit
```

Si se obtienen 6 registros:

```text
hasNextPage = true
```

Si se obtienen 5 o menos:

```text
hasNextPage = false
```

El sexto registro no se devuelve al cliente. Solamente se utiliza para determinar si existe una página siguiente.

---

## Preparación de la respuesta

Cuando existen más de 5 resultados, se eliminan los registros adicionales:

```ts
const accountsToReturn = hasNextPage
    ? suspendedAccounts.slice(0, limit)
    : suspendedAccounts
```

De esta manera, la respuesta siempre contiene como máximo 5 cuentas.

---

## Selección de datos

El servicio transforma los resultados del repository para devolver únicamente los datos necesarios:

```ts
return {
    accounts: accountsToReturn.map(a => ({
        id: a.id,
        username: a.username,
        email: a.email,
        pic: a.pic
    })),
    hasNextPage
}
```

La respuesta contiene:

- `id`
- `username`
- `email`
- `pic`
- `hasNextPage`

No se exponen directamente otros campos internos del modelo `User`.

---

## Resultado

El método devuelve:

```ts
{
    accounts: [...],
    hasNextPage: boolean
}
```

Ejemplo:

```json
{
    "accounts": [
        {
            "id": 9352,
            "username": "common1",
            "email": "common1@test.com",
            "pic": "fakepic.png"
        }
    ],
    "hasNextPage": true
}
```

---

## Separación de responsabilidades

| Capa | Responsabilidad |
|---|---|
| Controller | Autenticación, validación de query params y respuesta HTTP |
| Service | Autorización, construcción de filtros, paginación y transformación de datos |
| Repository | Ejecución de la consulta contra la base de datos |

El service concentra las reglas de negocio de esta operación y delega el acceso a Prisma al repository.

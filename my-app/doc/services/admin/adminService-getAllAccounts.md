# getAllAccounts

## Descripción

Servicio encargado de obtener el listado paginado de cuentas para la administración.

Verifica que el usuario autenticado esté activo y tenga permisos administrativos. El resultado y las cuentas visibles dependen del rol del administrador.

## Parámetros

### `userId`
ID del usuario autenticado.

### `page`
Número de página solicitada.

La paginación utiliza un límite fijo de **5 cuentas por página**.

### `search`
Parámetro opcional para filtrar cuentas por prefijo de `username` o `email`.

La búsqueda es insensible a mayúsculas/minúsculas.

## Autorización

1. Se obtiene el usuario mediante `requireActiveUserById(userId)`.
2. Se utiliza `requireAdmin(user.role)` para permitir únicamente usuarios con rol:
   - `admin`
   - `superAdmin`

Los usuarios no administrativos no pueden acceder al listado.

## Reglas de cuentas visibles

Como condición general:

- No se muestran cuentas suspendidas.
- No se muestran cuentas cuyo rol sea `superAdmin`.

### Usuario autenticado `superAdmin`

Puede obtener:

- cuentas `common` activas;
- cuentas `common` inactivas;
- cuentas `admin` activas;
- cuentas `admin` inactivas.

No se incluyen cuentas `superAdmin` ni cuentas suspendidas.

### Usuario autenticado `admin`

Se agrega la condición `isActive: false`.

Por lo tanto, solamente puede obtener:

- cuentas `common` inactivas;
- cuentas `admin` inactivas.

No se incluyen cuentas activas, suspendidas ni `superAdmin`.

## Búsqueda

Cuando se proporciona `search`, se agregan condiciones OR sobre:

- `username.startsWith(search)`
- `email.startsWith(search)`

La comparación utiliza `mode: 'insensitive'`.

Esto permite realizar búsquedas incrementales por prefijo, por ejemplo:

```text
c
co
com
```

## Paginación

Se utiliza:

```text
limit = 5
skip = (page - 1) * limit
take = limit + 1
```

Se solicita una cuenta adicional (`6` en lugar de `5`) para determinar si existe una página siguiente.

### `hasNextPage`

- Si se obtienen más de 5 registros, `hasNextPage` es `true`.
- Si se obtienen 5 o menos, `hasNextPage` es `false`.

Cuando existen más de 5 registros, se devuelven únicamente los primeros 5.

## Consulta al repositorio

El servicio delega la consulta a:

```text
adminRepo.findAllAccounts(where, skip, take)
```

El repositorio recibe las condiciones de filtrado y los parámetros de paginación.

## Datos devueltos

El servicio transforma cada cuenta y expone únicamente:

- `id`
- `username`
- `email`
- `isActive`
- `role`

No se exponen otros campos del modelo `User`.

## Retorno

```json
{
  "accounts": [
    {
      "id": 1,
      "username": "usuario1",
      "email": "usuario1@test.com",
      "isActive": false,
      "role": "common"
    }
  ],
  "hasNextPage": false
}
```

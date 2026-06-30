# locationService.toggleLocationStatus()

## Descripción

Alterna el estado de una locación (`isActive`).

Antes de realizar la operación verifica que el usuario exista, esté activo y posea permisos administrativos.

## Firma

```ts
toggleLocationStatus(userId: number, id: number): Promise<Location>
```

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| userId | number | Usuario autenticado |
| id | number | Identificador de la locación |

## Flujo

1. Valida el usuario mediante `requireActiveUserById(userId)`.
2. Verifica permisos con `requireAdmin(user.role)`.
3. Busca la locación por su identificador.
4. Si no existe, lanza `NotFoundError`.
5. Si está activa, la desactiva.
6. Si está inactiva, la activa.
7. Retorna la locación actualizada.

## Retorno

```ts
Promise<Location>
```

Devuelve la locación con su estado actualizado.

## Reglas de negocio

- Solo `admin` y `superAdmin` pueden cambiar el estado de una locación.
- La locación debe existir.
- La operación alterna el estado actual, no recibe un estado por parámetro.

## Posibles errores

| Error | Descripción |
|---|---|
| NotFoundError | La locación no existe |
| ForbiddenError | Usuario inactivo o sin permisos |
| InternalServerError | Error inesperado |

# locationService.renameLocation()

## Descripción

Actualiza el nombre de una locación existente.

Antes de realizar la modificación, verifica que el usuario autenticado exista, se encuentre activo y posea permisos administrativos.

## Firma

```ts
renameLocation(userId: number, locationId: number, name: string): Promise<Location>
```

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| userId | number | Identificador del usuario autenticado |
| locationId | number | Identificador de la locación |
| name | string | Nuevo nombre de la locación |

## Flujo

1. Valida el usuario mediante `requireActiveUserById(userId)`.
2. Verifica permisos administrativos con `requireAdmin(user.role)`.
3. Consulta la locación mediante `findLocationById(locationId)`.
4. Si la locación no existe, lanza `NotFoundError`.
5. Ejecuta `locationRepo.renameLocation(locationId, name)`.
6. Retorna la locación actualizada.

## Retorno

```ts
Promise<Location>
```

Devuelve la locación con el nombre actualizado.

## Reglas de negocio

- Solo usuarios con rol `admin` o `superAdmin` pueden modificar locaciones.
- La locación debe existir.
- El nombre recibido ya fue validado previamente por la capa de presentación mediante `locationInputSchema`.

## Posibles errores

| Error | Descripción |
|---|---|
| NotFoundError | La locación no existe |
| ForbiddenError | Usuario inactivo o sin permisos administrativos |
| ConflictError | Ya existe una locación con el mismo nombre |
| InternalServerError | Error inesperado durante la operación |

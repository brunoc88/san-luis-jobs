# locationService.getAllActiveLocations()

## Descripción

Obtiene todas las locaciones activas disponibles para usuarios autenticados.

Antes de consultar la información, verifica que el usuario exista y que su cuenta se encuentre activa.

## Firma

```ts
getAllActiveLocations(userId: number): Promise<Locations>
```

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| userId | number | Identificador del usuario autenticado |

## Flujo

1. Verifica el usuario mediante `requireActiveUserById(userId)`.
2. Consulta las locaciones activas mediante `locationRepo.findAllActiveLocations()`.
3. Retorna el listado de locaciones.

## Retorno

```ts
Promise<Locations>
```

Devuelve un arreglo de locaciones activas.

## Reglas de negocio

- El usuario debe existir.
- El usuario debe estar activo.
- No se requieren permisos de administrador.
- Solo se devuelven locaciones con `isActive = true`.

## Posibles errores

| Error | Descripción |
|---|---|
| NotFoundError | El usuario no existe |
| ForbiddenError | El usuario se encuentra inactivo |
| InternalServerError | Error inesperado durante la consulta |

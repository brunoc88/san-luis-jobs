# locationService.getAllLocations()

## Descripción

Obtiene todas las locaciones registradas en el sistema.

Antes de consultar los datos, valida que el usuario autenticado:

- Exista en la base de datos.
- Se encuentre activo.
- Posea permisos de administrador (`admin` o `superAdmin`).

## Firma

```ts
getAllLocations(userId: number): Promise<Locations>
```

## Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| userId | number | Identificador del usuario autenticado |

## Flujo

1. Ejecuta `requireActiveUserById(userId)`.
2. Verifica que el usuario exista.
3. Verifica que el usuario esté activo.
4. Ejecuta `requireAdmin(user.role)`.
5. Verifica permisos administrativos.
6. Consulta todas las locaciones mediante `locationRepo.findAllLocations()`.
7. Retorna la colección de locaciones.

## Retorno

```ts
Promise<Locations>
```

Donde:

```ts
type Locations = Location[]
```

## Posibles errores

| Error | Descripción |
|---------|-------------|
| UnauthorizedError | No existe una sesión válida (controlado previamente en el endpoint) |
| NotFoundError | El usuario no existe |
| ForbiddenError | El usuario está inactivo o no posee permisos administrativos |
| InternalServerError | Error inesperado durante la operación |

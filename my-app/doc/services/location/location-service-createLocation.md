# locationService.createLocation()

## Descripción

Crea una nueva locación en el sistema.

Antes de realizar la operación, verifica que el usuario autenticado exista, se encuentre activo y posea permisos administrativos.

## Firma

```ts
createLocation(userId: number, location: string): Promise<Location>
```

## Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| userId | number | Identificador del usuario autenticado |
| location | string | Nombre de la locación a crear |
 
## Flujo

1. Ejecuta `requireActiveUserById(userId)`.
2. Verifica que el usuario exista.
3. Verifica que el usuario se encuentre activo.
4. Ejecuta `requireAdmin(user.role)`.
5. Verifica que el usuario posea rol `admin` o `superAdmin`.
6. Ejecuta `locationRepo.create(location)`.
7. Persiste la nueva locación en la base de datos.
8. Retorna la locación creada.

## Retorno

```ts
Promise<Location>
```

Devuelve la locación creada.

## Reglas de negocio

- Solo usuarios con rol `admin` o `superAdmin` pueden crear locaciones.
- El usuario debe existir en la base de datos.
- El usuario debe encontrarse activo.
- La validación del nombre de la locación es responsabilidad de capas previas.

## Posibles errores

| Error | Descripción |
|---------|-------------|
| NotFoundError | El usuario no existe |
| ForbiddenError | Usuario inactivo o sin permisos administrativos |
| ConflictError | La locación ya existe |
| InternalServerError | Error inesperado durante la operación |

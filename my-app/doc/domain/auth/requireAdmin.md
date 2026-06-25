# requireAdmin()

## Descripción

Función de dominio utilizada para verificar permisos administrativos.

Permite continuar la ejecución únicamente cuando el usuario posee alguno de los roles administrativos definidos por la aplicación.

## Firma

```ts
requireAdmin(role: UserRole): void
```

## Tipo utilizado

```ts
type UserRole = "common" | "admin" | "superAdmin"
```

## Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| role | UserRole | Rol del usuario autenticado |

## Roles permitidos

Los siguientes roles son considerados administrativos:

- `admin`
- `superAdmin`

## Roles rechazados

- `common`

## Flujo

1. Recibe el rol del usuario.
2. Verifica si el rol es `admin` o `superAdmin`.
3. Si el rol no posee permisos administrativos, lanza una excepción.
4. Si el rol es válido, permite continuar la ejecución.

## Retorno

```ts
void
```

La función no retorna datos.

Su propósito es validar permisos y detener la ejecución cuando el usuario no está autorizado.

## Posibles errores

| Error | Descripción |
|---------|-------------|
| ForbiddenError | El usuario no posee permisos administrativos |
| InternalServerError | Error inesperado durante la ejecución |

## Casos de uso

Ejemplos de operaciones protegidas:

- Crear locaciones.
- Editar locaciones.
- Activar o desactivar locaciones.
- Administración de recursos internos.

## Reglas de negocio

- Los usuarios con rol `common` no pueden acceder a funcionalidades administrativas.
- Los usuarios con rol `admin` pueden acceder.
- Los usuarios con rol `superAdmin` pueden acceder.

# Documentación - `jobService.deleteJob()`

## Objetivo

`deleteJob()` implementa la lógica de negocio necesaria para que un
usuario elimine una publicación de empleo.

La eliminación realizada es lógica (soft delete), por lo que el registro
permanece almacenado en la base de datos.

------------------------------------------------------------------------

## Firma

``` ts
deleteJob(userId: number, jobId: number): Promise<void>
```

## Parámetros

### userId

Identificador del usuario autenticado obtenido mediante
`requireSession()`.

### jobId

Identificador del empleo que se desea eliminar.

------------------------------------------------------------------------

## Flujo de ejecución

### 1. Validar el usuario

``` ts
const user = await requireActiveUserById(userId)
```

Se verifica que el usuario exista y que se encuentre activo.

### 2. Validar el empleo

``` ts
const job = await requireActiveJobById(jobId)
```

Se verifica que el empleo:

-   Exista.
-   No haya sido eliminado.
-   No se encuentre suspendido.

### 3. Verificar permisos

``` ts
if (user.id !== job.autorId)
    throw new ForbiddenError("No tenés permiso para eliminar este empleo")
```

Solo el autor de la publicación puede eliminarla.

### 4. Eliminar el empleo

``` ts
await jobRepo.delete(jobId)
```

El Repository realiza un **soft delete** estableciendo
`isActive = false`.

------------------------------------------------------------------------

## Responsabilidades

-   Validar el usuario.
-   Validar el empleo.
-   Verificar permisos.
-   Delegar la persistencia al Repository.

------------------------------------------------------------------------

## Reglas de negocio

-   Solo el autor puede eliminar su propia publicación.
-   El estado del empleo (`active`, `paused` o `completed`) no impide su
    eliminación.
-   Los empleos suspendidos no pueden eliminarse mediante este endpoint.
-   Los administradores moderan publicaciones mediante otro endpoint
    específico.
-   La eliminación es lógica (soft delete).

------------------------------------------------------------------------

## Arquitectura

``` text
DELETE /api/jobs/:id
        │
        ▼
jobService.deleteJob()
        │
        ├── requireActiveUserById()
        ├── requireActiveJobById()
        ├── Validación de autor
        └── jobRepo.delete()
```

## Decisión de diseño

El Service concentra la lógica de negocio del caso de uso, mientras que
el Repository únicamente se encarga de la persistencia de datos. Esta
separación mantiene una arquitectura limpia y facilita el mantenimiento
del sistema.

# getUserAuditById

## Descripción

`getUserAuditById` obtiene la información de auditoría correspondiente a la suspensión de un usuario.

El método está destinado exclusivamente a usuarios con rol `superAdmin` y solo permite consultar la auditoría de un usuario que se encuentra actualmente suspendido.

La información obtenida desde el repositorio es transformada antes de ser retornada, exponiendo únicamente los datos necesarios para la auditoría y evitando devolver identificadores u otra información interna.

## Parámetros

- `userId: number`: ID del usuario que realiza la solicitud.
- `suspendedUserId: number`: ID del usuario cuya suspensión se desea auditar.

## Flujo y validaciones

### 1. Verificar al usuario que realiza la solicitud

Se obtiene el usuario mediante `requireActiveUserById(userId)`.

El usuario debe tener una cuenta activa.

### 2. Verificar el rol

Solo un usuario con rol `superAdmin` puede acceder a la auditoría.

Si el usuario no tiene este rol, se lanza `ForbiddenError`.

### 3. Buscar al usuario suspendido

Se obtiene el usuario objetivo mediante `userRepo.findById(suspendedUserId)`.

Si el usuario no existe, se lanza `NotFoundError`.

### 4. Impedir la consulta de la propia auditoría

Un usuario no puede consultar su propia auditoría de suspensión.

Si el `userId` coincide con el `suspendedUserId`, se lanza `ForbiddenError`.

### 5. Impedir la auditoría entre usuarios del mismo rol

No se permite consultar la auditoría de un usuario que tenga el mismo rol que quien realiza la solicitud.

En este contexto, un `superAdmin` no puede consultar la auditoría de otro `superAdmin`.

Se lanza:

`ForbiddenError('No puedes ver esta auditoría')`

### 6. Verificar que el usuario esté suspendido

La auditoría solo puede consultarse cuando el usuario objetivo se encuentra actualmente suspendido.

Si `isSuspended` es `false`, se lanza:

`ForbiddenError('El usuario no cuenta con suspension')`

### 7. Obtener la información de auditoría

Una vez superadas las validaciones, se consulta el repositorio mediante:

`adminRepo.findUserAuditById(suspendedUserData.id)`

El repositorio obtiene los registros relacionados con la suspensión, incluyendo la información de la publicación, el motivo de la suspensión y el administrador que generó el warning.

### 8. Limpiar la información antes de retornarla

La información recibida desde el repositorio se transforma mediante `map()`.

La respuesta final contiene únicamente:

- `jobInfo`
  - `title`
  - `description`
  - `createdAt`
  - `author`
- `suspensionInfo`
  - `reason`
  - `date`
  - `by`

No se retornan IDs, datos internos del modelo ni información sensible que no sea necesaria para la auditoría.

## Responsabilidades

Este método es responsable de:

- validar que el solicitante sea un `superAdmin` activo;
- validar la existencia del usuario objetivo;
- impedir que un usuario consulte su propia auditoría;
- impedir la consulta de auditorías entre usuarios del mismo rol;
- verificar que el usuario objetivo esté actualmente suspendido;
- solicitar los datos de auditoría al repositorio;
- transformar y limpiar la información antes de enviarla al consumidor.

La consulta a la base de datos es responsabilidad del repositorio. El controller se encarga de recibir la solicitud y devolver la respuesta HTTP.

## Resultado

El método retorna un arreglo con la información necesaria para que un `superAdmin` pueda auditar las publicaciones asociadas a la suspensión de un usuario.

Ejemplo conceptual:

```ts
[
    {
        jobInfo: {
            title: string,
            description: string,
            createdAt: Date,
            author: string
        },
        suspensionInfo: {
            reason: string,
            date: Date,
            by: string
        }
    }
]
```

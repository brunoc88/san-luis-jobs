# activateUserAccount

## Descripción

`activateUserAccount` permite a un usuario con permisos administrativos reactivar una cuenta que se encuentra desactivada voluntariamente o que nunca fue activada al crearla.

Este método no permite reactivar cuentas suspendidas. Las cuentas suspendidas deben utilizar el flujo específico de reactivación de suspensión.

## Parámetros

- `userId: number`: ID del usuario que realiza la solicitud.
- `inactiveUserId: number`: ID del usuario cuya cuenta se desea activar.

## Flujo y validaciones

### 1. Verificar al usuario que realiza la solicitud

Se obtiene el usuario mediante `requireActiveUserById(userId)`.

El usuario que realiza la operación debe tener una cuenta activa.

### 2. Verificar permisos administrativos

Se utiliza `requireAdmin(user.role)` para garantizar que el usuario tenga un rol con permisos administrativos.

Los roles autorizados son `admin` y `superAdmin`.

### 3. Buscar la cuenta objetivo

Se obtiene la cuenta mediante `userRepo.findById(inactiveUserId)`.

Si el usuario no existe, se lanza `NotFoundError`.

### 4. Impedir la activación de cuentas suspendidas

Si la cuenta objetivo tiene `isSuspended = true`, la operación se rechaza mediante:

`ForbiddenError('Accion invalida: Cuenta suspendida')`

Las cuentas suspendidas deben reactivarse mediante el flujo específico de suspensión.

### 5. Verificar que la cuenta esté realmente inactiva

Si la cuenta objetivo ya tiene `isActive = true`, se rechaza la operación mediante:

`ForbiddenError('La cuenta ya esta activa!')`

### 6. Restricciones por rol

Un usuario con rol `admin` no puede activar una cuenta cuyo rol sea `superAdmin`.

Un `superAdmin` tampoco puede activar la cuenta de otro `superAdmin`.

Por lo tanto, las combinaciones permitidas son:

| Usuario que activa | Cuenta objetivo | Resultado |
|---|---|---|
| `admin` | `common` | Permitido |
| `admin` | `admin` | Permitido |
| `admin` | `superAdmin` | Rechazado |
| `superAdmin` | `common` | Permitido |
| `superAdmin` | `admin` | Permitido |
| `superAdmin` | `superAdmin` | Rechazado |

### 7. Verificar existencia de Token

Si existe un token vinculado al usuario se procedera a eliminarlo

### 8. Activar la cuenta

Una vez superadas todas las validaciones, se llama a:

`adminRepo.activateUserAccountById(inactiveUserData.id)`

El repository es responsable de realizar la modificación correspondiente en la base de datos.

## Sobre la activación de la propia cuenta

No es necesaria una validación específica para impedir que un usuario active su propia cuenta.

El método comienza utilizando `requireActiveUserById(userId)`, por lo que el usuario que realiza la solicitud debe estar activo. Si intenta utilizar su propio ID como `inactiveUserId`, la cuenta ya estará activa y la validación correspondiente rechazará la operación.

## Separación de responsabilidades

El service es responsable de:

- validar que el solicitante esté activo;
- validar sus permisos administrativos;
- verificar que la cuenta objetivo exista;
- impedir la activación de cuentas suspendidas;
- impedir la activación de cuentas que ya están activas;
- aplicar las restricciones relacionadas con los roles;
- verificar existencia de token;
- solicitar al repository la activación de la cuenta.

El repository es responsable de modificar la base de datos.

El controller es responsable de recibir la solicitud HTTP y delegar la operación al service.

## Resultado

La operación activa la cuenta objetivo cuando todas las reglas de negocio se cumplen.

No se retorna información de la cuenta desde este método; la modificación de estado es realizada por el repository.

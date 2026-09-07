# `toggleRole` — Service

## Descripción

`toggleRole` gestiona el otorgamiento o la revocación del rol `admin` de un usuario.

La operación solamente puede ser ejecutada por un usuario con rol `superAdmin`.

Según el rol actual del usuario seleccionado:

- `admin` → se revoca el rol y vuelve a `common`.
- `common` → se otorga el rol `admin`.
- `superAdmin` → no puede ser modificado mediante esta operación.

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `userId` | `number` | ID del usuario autenticado que solicita la operación. |
| `selectedUserId` | `number` | ID del usuario cuyo rol será modificado. |

## Validaciones

### Usuario solicitante

Se obtiene mediante `requireActiveUserById(userId)` y debe poseer el rol `superAdmin`.

Si no posee el rol requerido, se lanza `ForbiddenError`.

### Usuario seleccionado

Se obtiene mediante `userRepo.findById(selectedUserId)`.

Si no existe, se lanza `NotFoundError`.

### No modificar el propio rol

El `superAdmin` no puede utilizar esta operación sobre su propia cuenta.

Si ambos IDs coinciden, se lanza `ForbiddenError`.

### No modificar otro `superAdmin`

Si el usuario seleccionado también posee el rol `superAdmin`, la acción se considera inválida y se lanza `ForbiddenError`.

## Lógica de la operación

### Revocar rol

Si el usuario seleccionado tiene actualmente el rol `admin`:

1. Se ejecuta `adminRepo.revokeAdminRoleById()`.
2. El usuario pierde el rol `admin` y vuelve a `common`.
3. El resultado se establece como `revoked`.

La revocación no depende de que la cuenta esté activa o suspendida. Esto permite retirar el privilegio administrativo incluso de una cuenta desactivada o suspendida.

### Otorgar rol

Si el usuario seleccionado no tiene el rol `admin`:

1. Se verifica que su cuenta esté activa.
2. Se verifica que no esté suspendida.
3. Si no cumple alguna condición, se lanza `ForbiddenError`.
4. Se ejecuta `adminRepo.assignAdminRoleById()`.
5. El usuario recibe el rol `admin`.
6. El resultado se establece como `granted`.

Una cuenta inactiva o suspendida no puede recibir el rol `admin`.

## Valor retornado

El método devuelve:

| Propiedad | Tipo | Descripción |
|---|---|---|
| `email` | `string` | Email del usuario cuyo rol fue modificado. |
| `result` | `"granted" \| "revoked"` | Acción realizada sobre el rol. |

Ejemplo:

```ts
{
    email: "usuario@email.com",
    result: "granted"
}
```

El controller utiliza `result` para determinar qué notificación por correo debe enviar.

## Responsabilidades

El service es responsable de:

- validar al usuario solicitante;
- verificar la autorización del `superAdmin`;
- obtener y validar al usuario seleccionado;
- impedir modificaciones sobre el propio rol;
- impedir modificaciones sobre otro `superAdmin`;
- determinar si corresponde otorgar o revocar el rol;
- aplicar las condiciones necesarias para otorgar privilegios;
- delegar la modificación al repository;
- devolver el email y el resultado de la operación.

El service **no se encarga del envío del correo electrónico**. Esa responsabilidad permanece en el controller mediante `mailService`.

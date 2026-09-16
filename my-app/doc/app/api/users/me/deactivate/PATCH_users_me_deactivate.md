# PATCH /api/users/me/deactivate

## Descripción

Permite al usuario autenticado desactivar su propia cuenta.

La desactivación de la cuenta es lógica. El registro del usuario permanece en la base de datos.

## Autenticación

Requiere una sesión activa.

## Request

### Body

```json
{
  "password": "string"
}
```

El body se valida mediante `deactivateAccountSchema`.

## Flujo

1. Obtiene el `userId` de la sesión.
2. Valida el body mediante `deactivateAccountSchema`.
3. Envía `userId` y `password` al service `deactivateMyAccount`.
4. El service verifica que la cuenta esté activa.
5. Verifica la contraseña mediante bcrypt.
6. Desactiva los Jobs del usuario de forma lógica.
7. Elimina físicamente los `SavedJob` del usuario.
8. Desactiva la cuenta de forma lógica (`isActive = false`).

## Response

### 200 — OK

```json
{
  "ok": true
}
```

## Errores

- `400` — Datos inválidos o contraseña que no cumple las reglas de validación.
- `401` — No existe una sesión válida.
- `403` — Contraseña incorrecta o cuenta no habilitada según las reglas del service.
- `404` — Usuario no encontrado, si corresponde.

## Persistencia

### User

La cuenta no se elimina físicamente.

```text
isActive: true → false
```

### Jobs

Los Jobs del usuario no se eliminan físicamente. Se desactivan de forma lógica.

El valor de `isSuspended` no se modifica.

### SavedJob

Los registros asociados al usuario se eliminan físicamente.

## Consideraciones V1

Si el usuario posteriormente reactiva su cuenta, sus Jobs no deben reactivarse automáticamente. Permanecen inactivos hasta que corresponda activarlos según las reglas definidas para la V2.

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

## Rate Limit

- Límite: 5 solicitudes por hora.
- Identificador: userId del usuario autenticado.
- Key: deactivate-my-account:user:${userId}
- Configuración: rateLimitConfig.deactivateMyAccount.user

El rate limit se aplica después de validar el body y antes de ejecutar el service.

Si se supera el límite, responde:

`429 Too Many Requests`

```js
{
  "error": "Too many requests"
}
```

## Flujo

1. Obtiene el `userId` de la sesión.
2. Valida el body mediante `deactivateAccountSchema`.
3. Aplica el rate limit utilizando el userId autenticado.
4. Envía `userId` y `password` al service `deactivateMyAccount`.
5. El service verifica que la cuenta esté activa.
6. Verifica la contraseña mediante bcrypt.
7. Desactiva los Jobs del usuario de forma lógica.
8. Elimina físicamente los `SavedJob` del usuario.
9. Desactiva la cuenta de forma lógica (`isActive = false`).

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
- `429` — Se superó el límite de solicitudes permitido.
- `500` — Error interno del servidor.


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

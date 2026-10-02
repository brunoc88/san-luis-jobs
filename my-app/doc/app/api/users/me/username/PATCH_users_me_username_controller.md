# Controller — PATCH /api/users/me/username

## Propósito
Permite al usuario autenticado cambiar su username.

## Rate Limit

- **Límite:** 10 solicitudes por hora.
- **Identificador:** `userId` del usuario autenticado.
- **Key:** `change-username:user:${userId}`
- **Configuración:** `rateLimitConfig.changeUsername.user`

El rate limit se aplica después de validar el body y antes de ejecutar el service.

Si se supera el límite permitido, responde con:

**HTTP 429 — Too Many Requests**

```json
{
  "error": "Too many requests"
}
```

## Flujo
1. Obtiene el `userId` mediante `requireSession()`.
2. Valida el request con `changeUsernameSchema`.
3. Si la validación falla, devuelve el error correspondiente.
4. Aplica el rate limit utilizando el userId autenticado.
5. Extrae `username` de los datos validados.
6. Llama a `userService.changeUsername(userId, username)`.
7. Si finaliza correctamente, devuelve `200`.
8. Los errores son procesados mediante `errorHandler()`.

## Request
```json
{
  "username": "nuevoUsername"
}
```

## Respuesta exitosa
**HTTP 200**
```json
{
  "ok": true
}
```

## Errores principales
- **400** — datos inválidos según `changeUsernameSchema`.
- **401** — usuario no autenticado.
- **409** — username ya en uso; la constraint `@unique` genera `P2002`.
- **429** — se superó el límite de solicitudes permitido.
- **500** — error interno no contemplado.

## Responsabilidad
Autenticación, validación del input, aplicación del rate limit, delegación al service, respuesta HTTP y manejo de errores.

No comprueba directamente la disponibilidad del username.

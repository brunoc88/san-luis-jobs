# Controller — PATCH /api/users/me/password

## Propósito
Permite al usuario autenticado cambiar su contraseña.

El usuario debe enviar su contraseña actual y la nueva contraseña. La confirmación de la nueva contraseña se valida mediante el schema antes de llegar al service.

## Endpoint
**PATCH** `/api/users/me/password`

## Rate Limit

- **Límite:** 5 solicitudes por hora.
- **Identificador:** `userId` del usuario autenticado.
- **Key:** `change-password:user:${userId}`
- **Configuración:** `rateLimitConfig.changePassword.user`

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
2. Valida el request con `changePasswordSchema`.
3. Si la validación falla, devuelve el error y su status.
4. Aplica el rate limit utilizando el userId autenticado.
5. Obtiene `currentPassword` y `password` de los datos validados.
6. Llama a `userService.changePassword(userId, currentPassword, password)`.
7. Si finaliza correctamente, devuelve `200`.
8. Los errores son procesados mediante `errorHandler()`.

## Request
El body contiene la contraseña actual y la nueva contraseña. La nueva contraseña y su confirmación son validadas por `changePasswordSchema`.

## Respuesta exitosa
**HTTP 200**
```json
{
  "ok": true
}
```

## Errores principales
- **400** — datos inválidos según `changePasswordSchema`.
- **401** — usuario no autenticado.
- **403** — contraseña actual incorrecta.
- **404** — usuario no encontrado al recuperar sus datos.
- **409** - se superó el límite de solicitudes permitido.
- **500** — error interno no contemplado.

## Responsabilidad
Autenticación, validación del input, aplicación del rate limit, extracción de datos, delegación al service, respuesta HTTP y manejo de errores.

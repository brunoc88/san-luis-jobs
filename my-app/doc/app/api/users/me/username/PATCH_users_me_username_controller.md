# Controller — PATCH /api/users/me/username

## Propósito
Permite al usuario autenticado cambiar su username.

## Flujo
1. Obtiene el `userId` mediante `requireSession()`.
2. Valida el request con `changeUsernameSchema`.
3. Si la validación falla, devuelve el error correspondiente.
4. Extrae `username` de los datos validados.
5. Llama a `userService.changeUsername(userId, username)`.
6. Si finaliza correctamente, devuelve `200`.
7. Los errores son procesados mediante `errorHandler()`.

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
- **500** — error interno no contemplado.

## Responsabilidad
Autenticación, validación del input, delegación al service, respuesta HTTP y manejo de errores.

No comprueba directamente la disponibilidad del username.

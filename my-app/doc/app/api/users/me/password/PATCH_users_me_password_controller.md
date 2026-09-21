# Controller — PATCH /api/users/me/password

## Propósito
Permite al usuario autenticado cambiar su contraseña.

El usuario debe enviar su contraseña actual y la nueva contraseña. La confirmación de la nueva contraseña se valida mediante el schema antes de llegar al service.

## Endpoint
**PATCH** `/api/users/me/password`

## Flujo
1. Obtiene el `userId` mediante `requireSession()`.
2. Valida el request con `changePasswordSchema`.
3. Si la validación falla, devuelve el error y su status.
4. Obtiene `currentPassword` y `password` de los datos validados.
5. Llama a `userService.changePassword(userId, currentPassword, password)`.
6. Si finaliza correctamente, devuelve `200`.
7. Los errores son procesados mediante `errorHandler()`.

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
- **500** — error interno no contemplado.

## Responsabilidad
Autenticación, validación del input, extracción de datos, delegación al service, respuesta HTTP y manejo de errores.

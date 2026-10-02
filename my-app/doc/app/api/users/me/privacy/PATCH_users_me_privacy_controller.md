# Controller — PATCH /api/users/me/privacy

## Propósito
Permite al usuario autenticado cambiar la privacidad de su cuenta.

Funciona como un toggle:
- `true` → `false` (pública → privada)
- `false` → `true` (privada → pública)

No recibe el nuevo estado desde el cliente.

## Endpoint
**PATCH** `/api/users/me/privacy`

## Rate Limit

- **Límite:** 20 solicitudes por hora.
- **Identificador:** `userId` del usuario autenticado.
- **Key:** `change-privacy:user:${userId}`
- **Configuración:** `rateLimitConfig.changePrivacy.user`

El rate limit se aplica después de obtener la sesión y antes de ejecutar el service.

Si se supera el límite permitido, responde con:

**HTTP 429 — Too Many Requests**

```json
{
  "error": "Too many requests"
}
```

## Flujo
1. Obtiene el `userId` mediante `requireSession()`.
2. Aplica el rate limit utilizando el userId autenticado.
3. Llama a `userService.changePrivacy(userId)`.
4. Si finaliza correctamente, devuelve `200`.
5. Si ocurre un error, lo procesa `errorHandler()`.

## Request
No requiere body. La identidad se obtiene de la sesión autenticada.

## Respuesta exitosa
**HTTP 200**
```json
{
  "ok": true
}
```

## Errores

- `401` — usuario no autenticado.
- `404` — usuario no encontrado al recuperar sus datos.
- `429` — Se superó el límite de solicitudes permitido.
- `500` — Error interno del servidor.

## Responsabilidad
El controller obtiene la sesión, aplicar el rate limit, delega la lógica al service, devuelve la respuesta HTTP y maneja errores. La decisión del nuevo valor de `visibility` pertenece al service.

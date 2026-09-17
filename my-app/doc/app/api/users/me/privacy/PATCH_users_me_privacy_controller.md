# Controller — PATCH /api/users/me/privacy

## Propósito
Permite al usuario autenticado cambiar la privacidad de su cuenta.

Funciona como un toggle:
- `true` → `false` (pública → privada)
- `false` → `true` (privada → pública)

No recibe el nuevo estado desde el cliente.

## Endpoint
**PATCH** `/api/users/me/privacy`

## Flujo
1. Obtiene el `userId` mediante `requireSession()`.
2. Llama a `userService.changePrivacy(userId)`.
3. Si finaliza correctamente, devuelve `200`.
4. Si ocurre un error, lo procesa `errorHandler()`.

## Request
No requiere body. La identidad se obtiene de la sesión autenticada.

## Respuesta exitosa
**HTTP 200**
```json
{
  "ok": true
}
```

## Responsabilidad
El controller obtiene la sesión, delega la lógica al service, devuelve la respuesta HTTP y maneja errores. La decisión del nuevo valor de `visibility` pertenece al service.

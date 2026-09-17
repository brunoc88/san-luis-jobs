# Service — changePrivacy

## Propósito
Cambia el estado de privacidad de la cuenta del usuario autenticado invirtiendo el valor actual de `visibility`.

## Firma
```ts
changePrivacy: async (id: number)
```

## Flujo
1. Ejecuta `requireActiveUserById(id)` para comprobar que el usuario existe y está activo.
2. Obtiene los datos mediante `userRepo.findById(user.id)`.
3. Si no se encuentran, lanza `NotFoundError`.
4. Lee el valor actual de `visibility`.
5. Calcula el nuevo estado invirtiéndolo.
6. Llama a `userRepo.changePrivacyById(userData.id, nuevoVisibility)`.

## Toggle
```ts
    if(userData.visibility)await userRepo.changePrivacyById(userData.id, false)
    else await userRepo.changePrivacyById(userData.id, true)
```

| Estado actual | Nuevo estado |
|---|---|
| `true` — público | `false` — privado |
| `false` — privado | `true` — público |

## Responsabilidad
El service contiene la lógica de negocio del toggle. El cliente no decide directamente el nuevo estado.

## Seguridad
No solicita nuevamente la contraseña. La operación requiere una sesión autenticada y que la cuenta esté activa.

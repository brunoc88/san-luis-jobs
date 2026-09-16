# Service: `deactivateMyAccount`

## Descripción

Desactiva la cuenta de un usuario después de verificar que la cuenta esté activa y que la contraseña proporcionada sea correcta.

## Parámetros

```text
id: number
password: string
```

## Flujo

1. Verifica que el usuario exista y que su cuenta esté activa mediante `requireActiveUserById`.
2. Obtiene los datos del usuario mediante `userRepo.findById`.
3. Verifica que el usuario exista.
4. Compara la contraseña proporcionada con el hash almacenado utilizando `bcrypt.compare`.
5. Si la contraseña es incorrecta, lanza `ForbiddenError`.
6. Desactiva todos los Jobs del usuario mediante `jobRepo.deactivateAllMyJobsById`.
7. Elimina físicamente todos los `SavedJob` del usuario mediante `jobRepo.deleteAllMySavedJobsById`.
8. Desactiva la cuenta mediante `userRepo.deactivateMyAccountById`.

## Errores

- `404` — Usuario no encontrado.
- `403` — Contraseña incorrecta.
- El error correspondiente de `requireActiveUserById` si la cuenta no está habilitada.

## Resultado

No retorna información del usuario.

Si todas las operaciones finalizan correctamente, el service termina sin error y el controller devuelve:

```json
{
  "ok": true
}
```

## Consideraciones V1

La operación actualmente no utiliza una transacción.

La incorporación de una transacción queda como mejora para V2, junto con otras operaciones que requieran atomicidad.

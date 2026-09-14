# Documentación - POST `/api/auth/forgot-password`

## Objetivo

Este endpoint inicia el flujo de recuperación de contraseña.

La solicitud puede producir tres resultados según el estado de la cuenta:

- `ok`: la cuenta está activa y se genera un nuevo token de recuperación.
- `inactive`: la cuenta existe, pero está inactiva y no se permite solicitar la recuperación.
- `suspended`: la cuenta existe, pero está suspendida y no se permite solicitar la recuperación.

Si el usuario no existe, el servicio no devuelve datos y no se envía ningún email.

En todos los casos procesados correctamente, el endpoint responde `200 OK`.

## Flujo

1. Validar el body con `passwordRecoverySchema`.
2. Si la validación falla, devolver el error correspondiente.
3. Ejecutar `authService.requestPasswordRecovery()`.
4. Si el servicio no devuelve datos, responder `200 OK` sin enviar ningún email.
5. Según el resultado recibido:
   - `ok`: enviar el email de recuperación mediante `mailService.sendEmailPasswordRecovery()`.
   - `inactive`: enviar un email informando que no puede solicitar la recuperación porque la cuenta está inactiva.
   - `suspended`: enviar un email informando que no puede solicitar la recuperación porque la cuenta está suspendida.
6. Responder `200 OK`.

## Responsabilidades

### Controller

- Validar el request.
- Delegar la lógica al `authService`.
- Interpretar el resultado devuelto por el servicio.
- Enviar el email correspondiente mediante `mailService`.
- Responder al cliente.

### AuthService

- Buscar el usuario por email.
- Si el usuario no existe, no devolver datos.
- Si la cuenta está suspendida, devolver `suspended`.
- Si la cuenta está inactiva, devolver `inactive`.
- Si la cuenta está activa:
  - Buscar un token de recuperación existente.
  - Si existe, eliminarlo.
  - Generar un nuevo token y su hash.
  - Guardar únicamente el hash y la fecha de expiración.
  - Devolver el token original, el email y el resultado `ok`.

El token existente se reemplaza independientemente de si estaba vencido o no.

### MailService

Según el resultado:

- `ok`: enviar el email con el enlace/token de recuperación.
- `inactive`: informar que no puede solicitar la recuperación porque la cuenta está inactiva y que debe comunicarse con soporte para solicitar su activación.
- `suspended`: informar que no puede solicitar la recuperación porque la cuenta está suspendida.

## Resultados

### Usuario inexistente

El servicio devuelve `void`.

No se envía ningún email y el controller responde:

```json
{
  "ok": true
}
```

### Cuenta activa

Se elimina cualquier token de recuperación anterior, se genera uno nuevo y se envía el email de recuperación.

Resultado del servicio:

```ts
{
  token,
  email,
  result: "ok"
}
```

### Cuenta inactiva

No se genera un nuevo token de recuperación.

Resultado del servicio:

```ts
{
  email,
  result: "inactive"
}
```

### Cuenta suspendida

No se genera un nuevo token de recuperación.

Resultado del servicio:

```ts
{
  email,
  result: "suspended"
}
```

## Seguridad

- La respuesta HTTP es `200 OK` tanto si el email existe como si no.
- No se devuelve información al cliente que permita determinar si el email está registrado.
- No se devuelve información al cliente sobre si la cuenta está activa, inactiva o suspendida.
- No se devuelve información al cliente sobre la existencia de tokens anteriores.
- Para una cuenta activa, solamente se almacena el hash del token.
- El token original solamente se utiliza para construir/enviar el email de recuperación.
- Las cuentas inactivas y suspendidas no reciben tokens de recuperación.
- Un token anterior se elimina antes de crear el nuevo token de recuperación.

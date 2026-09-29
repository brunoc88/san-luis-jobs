# Documentación - POST `/api/auth/forgot-password`

## Objetivo

Este endpoint inicia el flujo de recuperación de contraseña.

La solicitud puede producir tres resultados según el estado de la cuenta:

- `ok`: la cuenta está activa y se genera un nuevo token de recuperación.
- `inactive`: la cuenta existe, pero está inactiva y no se permite solicitar la recuperación.
- `suspended`: la cuenta existe, pero está suspendida y no se permite solicitar la recuperación.

Si el usuario no existe, el servicio no devuelve datos y no se envía ningún email.

En todos los casos procesados correctamente, el endpoint responde `200 OK`.

El endpoint cuenta además con **rate limiting por IP y por email** para limitar solicitudes excesivas de recuperación de contraseña.

## Flujo

1. Obtener la IP del cliente mediante `getClientIp()`.
2. Si no es posible identificar la IP, responder `400 Bad Request`.
3. Validar el body con `passwordRecoverySchema`.
4. Si la validación falla, devolver el error correspondiente.
5. Aplicar el rate limit por IP.
6. Si se supera el límite por IP, responder `429 Too Many Requests`.
7. Aplicar el rate limit por email.
8. Si se supera el límite por email, responder `429 Too Many Requests`.
9. Ejecutar `authService.requestPasswordRecovery()`.
10. Si el servicio no devuelve datos, responder `200 OK` sin enviar ningún email.
11. Según el resultado recibido:
    - `ok`: enviar el email de recuperación mediante `mailService.sendEmailPasswordRecovery()`.
    - `inactive`: enviar un email informando que no puede solicitar la recuperación porque la cuenta está inactiva.
    - `suspended`: enviar un email informando que no puede solicitar la recuperación porque la cuenta está suspendida.
12. Responder `200 OK`.

## Rate Limit

El endpoint utiliza dos límites independientes:

- **Por IP:** `5` solicitudes cada `60 segundos`.
- **Por email:** `3` solicitudes cada `15 minutos`.

Las claves utilizadas son:

```text
password-recovery:ip:{clientIp}
password-recovery:email:{email}
```

El límite por IP controla la cantidad de solicitudes realizadas desde un mismo cliente.

El límite por email evita que un mismo correo electrónico reciba un número excesivo de solicitudes, incluso si las solicitudes provienen de diferentes IPs.

Cuando cualquiera de los límites es superado, el endpoint responde:

```json
{
  "error": "Too many requests"
}
```

con estado HTTP `429`.

## Responsabilidades

### Controller

- Obtener la IP del cliente.
- Validar que la IP pueda ser identificada.
- Validar el request.
- Aplicar el rate limit por IP.
- Aplicar el rate limit por email.
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

### Rate limit superado

Si se supera el límite por IP o por email, el servicio de recuperación **no es ejecutado**.

El controller responde:

```json
{
  "error": "Too many requests"
}
```

con estado HTTP `429`.

## Seguridad

- La respuesta HTTP es `200 OK` tanto si el email existe como si no.
- No se devuelve información al cliente que permita determinar si el email está registrado.
- No se devuelve información al cliente sobre si la cuenta está activa, inactiva o suspendida.
- No se devuelve información al cliente sobre la existencia de tokens anteriores.
- Para una cuenta activa, solamente se almacena el hash del token.
- El token original solamente se utiliza para construir/enviar el email de recuperación.
- Las cuentas inactivas y suspendidas no reciben tokens de recuperación.
- Un token anterior se elimina antes de crear el nuevo token de recuperación.
- Se limita la cantidad de solicitudes por IP mediante rate limiting.
- Se limita la cantidad de solicitudes dirigidas a un mismo email mediante rate limiting.
- Las solicitudes que superan cualquiera de los límites son rechazadas con `429 Too Many Requests`.

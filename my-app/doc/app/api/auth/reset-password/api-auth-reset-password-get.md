# Documentación - GET `/api/auth/reset-password`

## Objetivo

Validar que el token de recuperación de contraseña recibido desde el enlace enviado por correo electrónico sea válido antes de permitir al usuario establecer una nueva contraseña.

Este endpoint **no modifica información en la base de datos**. Su única responsabilidad es verificar que el token pueda utilizarse.

Además, el endpoint cuenta con **rate limiting por IP** para limitar solicitudes excesivas de validación de tokens.

---

## Flujo de ejecución

1. Obtener la IP del cliente mediante `getClientIp()`.
2. Si no es posible identificar la IP, responder `400 Bad Request`.
3. Aplicar el rate limit por IP.
4. Si se supera el límite, responder `429 Too Many Requests`.
5. Obtener el parámetro `token` desde la URL.
6. Delegar la validación del token a `requireToken()`.
7. Si el token es válido, responder indicando que el enlace puede utilizarse.
8. Si ocurre algún error (token inexistente, inválido o expirado), delegar la respuesta al `errorHandler`.

---

## Rate Limit

El endpoint utiliza un límite por IP de:

- **10 solicitudes cada 60 segundos.**

La clave utilizada es:

```text
reset-password:ip:{clientIp}
```

El límite se aplica antes de realizar la validación del token.

Cuando se supera el límite, el endpoint responde:

```json
{
  "error": "Too many requests"
}
```

con estado HTTP `429 Too Many Requests`.

---

## Responsabilidades

### Controller

- Obtener la IP del cliente.
- Validar que la IP pueda ser identificada.
- Aplicar el rate limit por IP.
- Obtener el token desde los parámetros de la URL.
- Delegar la validación al helper `requireToken()`.
- Responder al cliente cuando el token sea válido.
- Delegar el manejo de errores al `errorHandler`.

### requireToken()

La función se encarga de validar el token recibido, incluyendo:

- Verificar que el token haya sido enviado.
- Generar el hash SHA-256 del token.
- Buscar el hash en la base de datos.
- Comprobar que el token exista.
- Verificar que no haya expirado.

Si alguna de estas validaciones falla, lanza la excepción correspondiente.

---

## Respuesta exitosa

```http
HTTP/1.1 200 OK
```

```json
{
  "ok": true,
  "valid": true
}
```

El frontend puede utilizar esta respuesta para habilitar el formulario donde el usuario ingresará su nueva contraseña.

---

## Posibles errores

El endpoint delega el manejo de errores al `errorHandler`.

Entre los posibles escenarios se encuentran:

- IP no identificable.
- Límite de solicitudes superado (`429 Too Many Requests`).
- Token no enviado.
- Token inválido.
- Token expirado.

---

## Consideraciones

- Este endpoint únicamente valida el token.
- No modifica la contraseña del usuario.
- No elimina el token de la base de datos.
- Se limita la cantidad de solicitudes de validación por IP.
- El cambio de contraseña se realiza posteriormente mediante `POST /api/auth/reset-password`.

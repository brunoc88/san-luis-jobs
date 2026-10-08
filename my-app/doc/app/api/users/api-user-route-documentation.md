# POST /api/user/confirm

## Descripción

Endpoint encargado de registrar un nuevo usuario en el sistema. Su responsabilidad principal es recibir los datos enviados desde el formulario de registro, validarlos, crear la cuenta y enviar el correo de verificación correspondiente.
Antes de procesar la solicitud se aplica un límite de peticiones por dirección IP para evitar intentos excesivos de creación de cuentas.

## Flujo de ejecución

1. Se obtiene la dirección IP del cliente mediante `getClientIp`.
2. Si no es posible identificar la dirección IP:
   - Se retorna un error.
   - Se responde con código HTTP `400 Bad Request`.
3. Se ejecuta el `rateLimiter`utilizando la IP del cliente y la configuración correspondiente a la creación de usuarios.
4. Si se supera el límite de peticiones:
   - Se retorna el mensaje `"Demasiados intentos. Intente nuevamente más tarde."`.
   - Se responde con código HTTP `429 Too Many Requests`.
5. Se obtiene el `FormData` enviado por el cliente.
6. Se ejecuta `validateUserRequest`, responsable de validar los datos recibidos mediante esquemas Zod.
7. Si la validación falla:
   - Se retorna una respuesta con `ok: false`.
   - Se incluyen los errores de validación detectados.
   - Se responde con código HTTP `400 Bad Request`.
8. Si la validación es exitosa:
   - Se obtienen los datos ya tipados y validados.
   - Se recupera los archivos asociados al formulario (`file`) y (`cvFile`) sin validación adicional en esta etapa.
9. Se invoca `userService.createAccount`, encargado de crear la cuenta del usuario utilizando los datos validados y los archivos recibidos.
10. Una vez creada la cuenta, se ejecuta `mailService.sendEmailVerification` para enviar el correo de verificación junto con el token de activación.
11. Si todo el proceso finaliza correctamente, se responde con HTTP `201 Created`.

## Validaciones

La validación de la solicitud se encuentra centralizada en `validateUserRequest`, utilizando esquemas Zod para garantizar la integridad de los datos antes de interactuar con la capa de servicios.

Entre los campos validados se encuentran:

- Username
- Email
- Password
- Confirmación de password
- Descripción de usuario

Los archivos son opcionales y son preparados por validateUserRequest antes de ser enviados al servicio.

## Rate Limit
El endpoint aplica un límite de peticiones por dirección IP antes de procesar la creación de la cuenta.

El límite se obtiene desde `rateLimitConfig.createUser.ip`.

Cuando el límite es superado, el endpoint responde con:

**429 Too Many Requests**

y el mensaje:

**Demasiados intentos. Intente nuevamente más tarde.**

## Manejo de errores

Todo el flujo se encuentra encapsulado dentro de un bloque `try/catch`.

Las excepciones son delegadas a `errorHandler`, componente responsable de centralizar el manejo de errores y generar respuestas HTTP consistentes para la API.

## Responsabilidades

### Route Handler

- Recibir la solicitud HTTP.
- Identificar la IP del cliente.
- Aplicar el rate limit.
- Ejecutar las validaciones iniciales.
- Orquestar la creación de la cuenta.
- Disparar el envío del correo de verificación.
- Devolver la respuesta HTTP correspondiente.

### User Service

- Crear la cuenta del usuario utilizando los datos previamente validados.

### Mail Service

- Enviar el correo electrónico de verificación junto con el token de activación.

### Error Handler

- Procesar errores inesperados.
- Generar respuestas uniformes para la API.

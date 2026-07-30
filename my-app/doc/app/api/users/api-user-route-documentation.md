# POST /api/user/confirm

## Descripción

Endpoint encargado de registrar un nuevo usuario en el sistema. Su responsabilidad principal es recibir los datos enviados desde el formulario de registro, validarlos, crear la cuenta y enviar el correo de verificación correspondiente.

## Flujo de ejecución

1. Se obtiene el `FormData` enviado por el cliente.
2. Se ejecuta `validateUserRequest`, responsable de validar los datos recibidos mediante esquemas Zod.
3. Si la validación falla:
   - Se retorna una respuesta con `ok: false`.
   - Se incluyen los errores de validación detectados.
   - Se responde con código HTTP `400 Bad Request`.
4. Si la validación es exitosa:
   - Se obtienen los datos ya tipados y validados.
   - Se recupera los archivos asociados al formulario (`file`) y (`cvFile`) sin validación adicional en esta etapa.
5. Se invoca `userService.createAccount`, encargado de crear la cuenta del usuario utilizando los datos validados y los archivos recibidos.
6. Una vez creada la cuenta, se ejecuta `mailService.sendEmailVerification` para enviar el correo de verificación junto con el token de activación.
7. Si todo el proceso finaliza correctamente, se responde con HTTP `201 Created`.

## Validaciones

La validación de la solicitud se encuentra centralizada en `validateUserRequest`, utilizando esquemas Zod para garantizar la integridad de los datos antes de interactuar con la capa de servicios.

Entre los campos validados se encuentran:

- Username
- Email
- Password
- Confirmación de password
- Descripción de usuario

## Manejo de errores

Todo el flujo se encuentra encapsulado dentro de un bloque `try/catch`.

Las excepciones son delegadas a `errorHandler`, componente responsable de centralizar el manejo de errores y generar respuestas HTTP consistentes para la API.

## Responsabilidades

### Route Handler

- Recibir la solicitud HTTP.
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

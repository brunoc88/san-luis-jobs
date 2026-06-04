# GET /api/user/confirm

## Descripción

Endpoint encargado de confirmar y activar una cuenta de usuario previamente registrada.

Su responsabilidad es recibir el token de verificación enviado por correo electrónico, validar su estado y, en caso de ser válido, completar el proceso de activación de la cuenta.

## Flujo de ejecución

1. Se recibe una solicitud HTTP con el token incluido como parámetro de consulta.
2. Se extrae el valor del parámetro `token` desde la URL.
3. Se ejecuta `requireToken` para validar el token recibido.
4. Si el token no supera las validaciones, se genera una excepción que será procesada por el manejador de errores.
5. Si el token es válido, se obtiene la información asociada al mismo.
6. Se invoca `userService.confirmAccount` utilizando los datos devueltos por la validación.
7. El servicio activa la cuenta del usuario.
8. El token de verificación es eliminado para impedir reutilizaciones futuras.
9. Se responde con HTTP `200 OK`.

## Recepción del token

El token llega al backend mediante un parámetro de consulta incluido en la URL.

Ejemplo conceptual:

```text
https://frontend.com/confirm?token=TOKEN_GENERADO
```

Este token fue previamente enviado al usuario durante el proceso de registro mediante correo electrónico.

## Validación del token

La validación es delegada a la función `requireToken`.

Esta función centraliza todas las verificaciones relacionadas con los tokens de activación.

### Casos evaluados

#### Token inexistente

Se verifica que el parámetro haya sido enviado.

Ejemplo:

```text
/confirm
```

En este escenario la solicitud es considerada inválida.

#### Token inválido

Se verifica que exista un registro asociado al token recibido.

Si no existe una coincidencia válida, la solicitud es rechazada.

#### Token expirado

Se verifica que el token continúe dentro de su período de validez.

Si la fecha de expiración fue superada, el token deja de ser aceptado.

### Resultado exitoso

Si todas las verificaciones son superadas, la función devuelve la información asociada al token.

Estos datos son utilizados posteriormente por la capa de servicios para completar la activación de la cuenta.

## Activación de la cuenta

Una vez validado el token, la responsabilidad pasa al servicio de usuarios.

La función `confirmAccount` se encarga de:

- Activar la cuenta previamente creada.
- Asociar la activación al usuario correspondiente.
- Eliminar el token utilizado.

## Prevención de reutilización

Después de una activación exitosa, el token es eliminado.

Este comportamiento permite:

- Evitar reutilización de enlaces.
- Reducir riesgos de seguridad.
- Garantizar que cada token sea utilizado una única vez.

## Manejo de errores

Todo el flujo se encuentra encapsulado dentro de un bloque `try/catch`.

Las excepciones generadas por:

- `requireToken`
- `confirmAccount`
- Dependencias internas

son delegadas a `errorHandler`, encargado de generar respuestas HTTP consistentes para la aplicación.

## Responsabilidades

### Route Handler

- Recibir el token desde la URL.
- Delegar la validación del token.
- Orquestar la activación de la cuenta.
- Devolver la respuesta HTTP correspondiente.

### requireToken

- Verificar existencia del token.
- Verificar validez del token.
- Verificar expiración del token.
- Devolver la información asociada al token.

### User Service

- Activar la cuenta del usuario.
- Eliminar el token utilizado.

### Error Handler

- Centralizar el manejo de excepciones.
- Generar respuestas HTTP uniformes.

## Responsabilidad

Este endpoint representa la etapa final del proceso de registro, permitiendo que una cuenta previamente creada pase al estado activo mediante la validación de un token de verificación enviado por correo electrónico.

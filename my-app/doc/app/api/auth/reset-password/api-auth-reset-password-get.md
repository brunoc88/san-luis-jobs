# Documentación - GET `/api/auth/reset-password`

## Objetivo

Validar que el token de recuperación de contraseña recibido desde el
enlace enviado por correo electrónico sea válido antes de permitir al
usuario establecer una nueva contraseña.

Este endpoint **no modifica información en la base de datos**. Su única
responsabilidad es verificar que el token pueda utilizarse.

------------------------------------------------------------------------

## Flujo de ejecución

1.  Obtener el parámetro `token` desde la URL.
2.  Delegar la validación del token a `requireToken()`.
3.  Si el token es válido, responder indicando que el enlace puede
    utilizarse.
4.  Si ocurre algún error (token inexistente, inválido o expirado),
    delegar la respuesta al `errorHandler`.

------------------------------------------------------------------------

## Responsabilidades

### Controller

-   Obtener el token desde los parámetros de la URL.
-   Delegar la validación al helper `requireToken()`.
-   Responder al cliente cuando el token sea válido.
-   Delegar el manejo de errores al `errorHandler`.

### requireToken()

La función se encarga de validar el token recibido, incluyendo:

-   Verificar que el token haya sido enviado.
-   Generar el hash SHA-256 del token.
-   Buscar el hash en la base de datos.
-   Comprobar que el token exista.
-   Verificar que no haya expirado.

Si alguna de estas validaciones falla, lanza la excepción
correspondiente.

------------------------------------------------------------------------

## Respuesta exitosa

``` http
HTTP/1.1 200 OK
```

``` json
{
    "ok": true,
    "valid": true
}
```

El frontend puede utilizar esta respuesta para habilitar el formulario
donde el usuario ingresará su nueva contraseña.

------------------------------------------------------------------------

## Posibles errores

El endpoint delega el manejo de errores al `errorHandler`.

Entre los posibles escenarios se encuentran:

-   Token no enviado.
-   Token inválido.
-   Token expirado.

------------------------------------------------------------------------

## Consideraciones

-   Este endpoint únicamente valida el token.
-   No modifica la contraseña del usuario.
-   No elimina el token de la base de datos.
-   El cambio de contraseña se realiza posteriormente mediante
    `POST /api/auth/reset-password`.

# Documentación - `generateToken()`

## Objetivo

Generar un token seguro para procesos de autenticación, como:

-   Activación de cuentas.
-   Recuperación de contraseña.

La función devuelve tanto el token original como su versión hasheada y
la fecha de expiración.

------------------------------------------------------------------------

## Flujo de ejecución

1.  Generar un token aleatorio utilizando `crypto.randomBytes(32)`.
2.  Convertir el token a una cadena hexadecimal.
3.  Calcular el hash SHA-256 del token.
4.  Generar la fecha de expiración (24 horas desde su creación).
5.  Devolver toda la información necesaria para el flujo de
    autenticación.

------------------------------------------------------------------------

## Valores retornados

### `token`

Es el token original.

Se envía al usuario mediante un enlace por correo electrónico.

Ejemplo:

``` text
https://app.com/reset-password?token=abc123...
```

------------------------------------------------------------------------

### `tokenHash`

Es el resultado de aplicar SHA-256 sobre el token original.

Este valor es el que se almacena en la base de datos.

Nunca se envía al usuario.

------------------------------------------------------------------------

### `expiresAt`

Fecha y hora de expiración del token.

Una vez alcanzada esta fecha, el token deja de ser válido.

------------------------------------------------------------------------

## ¿Por qué se almacena el hash?

Guardar únicamente el hash evita que un atacante pueda utilizar
directamente los tokens si obtiene acceso a la base de datos.

Durante la validación:

1.  El backend recibe el token original enviado por el usuario.
2.  Calcula nuevamente su hash utilizando SHA-256.
3.  Busca ese hash en la base de datos.
4.  Si coincide y no expiró, el token se considera válido.

------------------------------------------------------------------------

## Valor de retorno

``` ts
{
    token: string;
    tokenHash: string;
    expiresAt: Date;
}
```

------------------------------------------------------------------------

## Consideraciones de seguridad

-   El token se genera mediante un generador criptográficamente seguro
    (`crypto.randomBytes`).
-   El token original nunca se almacena en la base de datos.
-   Únicamente se persiste el hash SHA-256.
-   El token posee una fecha de expiración para limitar su tiempo de
    uso.
-   El mismo mecanismo puede reutilizarse para distintos flujos basados
    en tokens temporales.

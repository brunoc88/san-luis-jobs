# Documentación - `authService.requestPasswordRecovery()`

## Objetivo

Iniciar el flujo de recuperación de contraseña de un usuario.

El servicio verifica que la solicitud sea válida, genera un token de
recuperación y almacena únicamente su hash en la base de datos. El token
original se devuelve al controller para que pueda enviarse por correo
electrónico.

------------------------------------------------------------------------

## Flujo de ejecución

1.  Buscar el usuario por su dirección de correo electrónico.
2.  Si el usuario no existe, finalizar la ejecución sin devolver
    errores.
3.  Si la cuenta no está activa, finalizar la ejecución.
4.  Verificar si el usuario ya posee un token de recuperación vigente.
5.  Si existe un token, finalizar la ejecución.
6.  Generar un nuevo token mediante `generateToken()`.
7.  Almacenar únicamente el `tokenHash` junto con el `userId` y la fecha
    de expiración.
8.  Devolver el `token` original y el email del usuario.

------------------------------------------------------------------------

## Responsabilidades

### Búsqueda del usuario

Obtiene el usuario asociado al correo electrónico recibido.

### Validaciones de seguridad

Por motivos de seguridad el servicio no informa si:

-   El usuario no existe.
-   La cuenta está inactiva.
-   Ya existe una solicitud de recuperación pendiente.

En cualquiera de estos casos simplemente finaliza la ejecución.

### Generación del token

La función `generateToken()` devuelve:

-   `token`: valor original que será enviado al usuario por email.
-   `tokenHash`: versión hasheada que será almacenada en la base de
    datos.
-   `expiresAt`: fecha de expiración del token.

### Persistencia

Únicamente se almacena el `tokenHash`.

El token original nunca se guarda en la base de datos.

### Resultado

Si la operación es exitosa devuelve:

``` ts
{
    token: string;
    email: string;
}
```

En caso contrario finaliza la ejecución sin devolver datos (`void`).

------------------------------------------------------------------------

## Consideraciones de seguridad

-   No se revela si el usuario existe.
-   No se revela si la cuenta está activa o inactiva.
-   No se generan múltiples tokens de recuperación para un mismo
    usuario.
-   El token enviado por correo nunca se almacena en texto plano.
-   La validación posterior se realiza comparando el hash del token
    recibido con el hash almacenado en la base de datos.

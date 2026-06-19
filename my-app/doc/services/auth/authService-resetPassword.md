# Documentación - `authService.resetPassword()`

## Objetivo

Completar el proceso de recuperación de contraseña utilizando un token
de recuperación válido.

El servicio valida el token recibido, verifica el estado del usuario,
actualiza la contraseña de forma segura y elimina el token para impedir
su reutilización.

------------------------------------------------------------------------

## Flujo de ejecución

1.  Validar el token mediante `requireToken()`.
2.  Obtener el usuario asociado al token.
3.  Verificar que el usuario exista.
4.  Verificar que la cuenta se encuentre activa.
5.  Generar el hash de la nueva contraseña utilizando `bcrypt`.
6.  Actualizar la contraseña del usuario.
7.  Eliminar el token de recuperación.
8.  Devolver el email del usuario al controller.

------------------------------------------------------------------------

## Responsabilidades

### Validación del token

Delega la validación a `requireToken()`, que verifica:

-   Que el token haya sido enviado.
-   Que exista en la base de datos.
-   Que no haya expirado.

Si alguna de estas condiciones no se cumple, se lanza la excepción
correspondiente.

### Validación del usuario

Una vez validado el token:

-   Se obtiene el usuario asociado.
-   Se verifica que exista.
-   Se comprueba que la cuenta esté activa.

### Actualización de la contraseña

Antes de persistirse, la contraseña se protege utilizando `bcrypt`.

El servicio genera el hash y delega la actualización al `userRepo`.

### Invalidación del token

Después de actualizar correctamente la contraseña, el token de
recuperación se elimina de la base de datos.

Esto garantiza que cada enlace de recuperación pueda utilizarse una
única vez.

### Resultado

Si la operación finaliza correctamente, devuelve:

``` ts
{
    email: string;
}
```

El email será utilizado posteriormente por el controller para enviar la
notificación de cambio de contraseña.

------------------------------------------------------------------------

## Consideraciones de seguridad

-   La contraseña nunca se almacena en texto plano.
-   Se utiliza `bcrypt` para generar el hash antes de persistirla.
-   El token debe ser válido y no encontrarse expirado.
-   El usuario debe existir y tener la cuenta activa.
-   El token de recuperación se elimina inmediatamente después del
    cambio de contraseña.
-   Cada token puede utilizarse una única vez.
-   El servicio no envía correos electrónicos; esa responsabilidad
    pertenece al `mailService`.

------------------------------------------------------------------------

## Dependencias

Este servicio utiliza:

-   `requireToken()`
-   `userRepo`
-   `verificationTokenRepo`
-   `bcrypt`

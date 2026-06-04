# userService.confirmAccount

## Descripción

Función responsable de completar el proceso de activación de una cuenta previamente registrada.

Su objetivo es verificar que el usuario asociado al token exista, validar que la cuenta aún no haya sido activada y, finalmente, habilitar la cuenta eliminando el token utilizado durante el proceso de confirmación.

## Flujo de ejecución

1. Se recibe el identificador del usuario y el token asociado al proceso de verificación.
2. Se consulta el repositorio de usuarios para obtener la información correspondiente.
3. Se verifica que el usuario exista.
4. Se verifica que la cuenta no se encuentre previamente activada.
5. Si las validaciones son correctas:
   - Se activa la cuenta.
   - Se elimina el token de verificación.
6. La función finaliza sin devolver información adicional.

## Búsqueda del usuario

La primera operación consiste en recuperar el usuario asociado al identificador recibido.

```ts
userRepo.findById(id)
```

Esta validación permite garantizar que la activación se realice únicamente sobre usuarios existentes.

## Validación de existencia

Si el usuario no existe, se genera:

```ts
NotFoundError
```

Este comportamiento evita realizar operaciones sobre registros inexistentes.

## Validación de estado

Antes de activar la cuenta se verifica el estado actual del usuario.

### Cuenta ya activa

Si el usuario ya se encuentra activado:

```ts
user.isActive === true
```

se genera:

```ts
BadRequestError
```

con el mensaje:

```text
cuenta ya activa
```

Esta validación impide reutilizar enlaces de activación sobre cuentas previamente confirmadas.

## Activación de la cuenta

Si todas las validaciones son superadas, se procede a activar el usuario.

La activación se delega al repositorio mediante:

```ts
userRepo.active(user.id)
```

A partir de este momento la cuenta pasa al estado activo dentro del sistema.

## Eliminación del token

Una vez completada la activación, el token utilizado es eliminado.

```ts
verificationTokenRepo.delete(token)
```

Este comportamiento permite:

- Garantizar uso único del token.
- Evitar reutilización de enlaces.
- Reducir riesgos de seguridad.
- Mantener limpia la tabla de verificaciones.

## Resultado

La función no devuelve información de dominio.

Su éxito queda representado por la ausencia de excepciones durante la ejecución.

```ts
return
```

## Seguridad

La función incorpora varias medidas de protección:

### Verificación de existencia

Evita operar sobre usuarios inexistentes.

### Prevención de reactivación

Impide reutilizar enlaces de activación sobre cuentas ya confirmadas.

### Invalidación del token

El token es eliminado inmediatamente después de una activación exitosa.

Esto garantiza que cada token pueda utilizarse una única vez.

## Responsabilidad

La responsabilidad de esta función es completar la transición de una cuenta desde el estado pendiente de verificación hacia el estado activo, asegurando la consistencia entre el usuario y el sistema de tokens de activación.

# requireToken

## Descripción

Función encargada de validar tokens de verificación utilizados durante los procesos de activación de cuenta.

Su responsabilidad es garantizar que el token recibido:

- Exista.
- Sea válido.
- No haya expirado.

Si alguna de estas condiciones no se cumple, la función genera una excepción específica que será procesada por las capas superiores.

## Flujo de ejecución

1. Se recibe el token enviado por el usuario.
2. Se verifica que el token exista.
3. El token recibido es transformado mediante SHA-256.
4. Se busca un registro asociado al hash generado.
5. Se verifica que el token exista en la base de datos.
6. Se verifica que el token no haya expirado.
7. Si todas las validaciones son correctas, se devuelve la información asociada al token.

## Validación de existencia

La primera validación consiste en comprobar que el token haya sido enviado.

Ejemplo inválido:

```text
/confirm
```

Si el token no existe, se genera:

```ts
BadRequestError
```

con el mensaje:

```text
Token requerido
```

## Hashing del token

Por motivos de seguridad, los tokens no se almacenan en texto plano.

Para realizar la búsqueda:

1. Se recibe el token original.
2. Se genera un hash SHA-256.
3. El hash resultante es utilizado para consultar la base de datos.

Este mecanismo permite validar el token sin necesidad de almacenar información sensible en texto plano.

## Búsqueda del token

Una vez generado el hash, se consulta el repositorio:

```ts
verificationTokenRepo.findByToken()
```

Si no existe un registro asociado, se genera:

```ts
NotFoundError
```

con el mensaje:

```text
Token inválido
```

## Validación de expiración

Si el token existe, se verifica su fecha de expiración.

La comparación se realiza contra la fecha y hora actual del sistema.

Si el token se encuentra vencido, se genera:

```ts
BadRequestError
```

con el mensaje:

```text
Token expirado
```

## Resultado exitoso

Cuando todas las validaciones son superadas, la función devuelve el registro de verificación asociado.

La información retornada puede incluir:

- Identificador del usuario.
- Token almacenado.
- Fecha de expiración.
- Datos adicionales asociados al proceso de verificación.

Estos datos son posteriormente utilizados por la capa de servicios para completar la activación de la cuenta.

## Seguridad

La función implementa varias medidas de seguridad:

### Tokens hasheados

Los tokens nunca son almacenados en texto plano.

### Validación temporal

Los tokens poseen una fecha de expiración obligatoria.

### Validación de existencia

Únicamente se aceptan tokens previamente registrados por el sistema.

## Responsabilidad

La responsabilidad de esta función es centralizar todas las validaciones relacionadas con tokens de activación.

De esta manera, los servicios que consumen tokens pueden asumir que cualquier valor devuelto por `requireToken` ya ha sido verificado y es seguro para continuar con la lógica de negocio correspondiente.

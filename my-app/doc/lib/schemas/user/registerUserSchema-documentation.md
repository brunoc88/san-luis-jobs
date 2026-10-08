# registerUserSchema

## Descripción

Esquema de validación encargado de verificar los datos necesarios para el registro de nuevos usuarios.

La implementación utiliza Zod para validar la estructura, el formato y las reglas de validación definidas para los datos antes de permitir la creación de una cuenta.

Además de validar los campos individuales, el esquema incorpora una validación cruzada entre las contraseñas.

## Campos validados

### Email

Valida que el campo:

- Sea un `string`.
- No se encuentre vacío.
- Posea un formato de correo electrónico válido.
- Elimine espacios innecesarios mediante `trim()`.

### Username

Valida que el nombre de usuario:

- Sea un `string`.
- No se encuentre vacío.
- Posea un mínimo de 5 caracteres.
- No supere los 25 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

### Password

Valida que la contraseña:

- Sea un `string`.
- No se encuentre vacía.
- Posea un mínimo de 8 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

### Password Confirmation

Valida que el campo de confirmación:

- Sea un `string`.
- No se encuentre vacío.
- Posea un mínimo de 8 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

### Description

Valida que la descripción:

- Sea opcional.
- No supere los 150 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

### File

Valida que el campo:

- Sea opcional.
- Corresponda a un `FileList`.

El esquema no realiza en este punto una validación del tipo MIME ni del tamaño del archivo.

### CV File

Valida que el campo:

- Sea opcional.
- Corresponda a un `FileList`.

El esquema no realiza en este punto una validación del tipo MIME ni del tamaño del archivo.

## Validación cruzada

Además de las validaciones individuales, el esquema incorpora una regla adicional mediante `refine`.

Esta validación garantiza que:

- `password`
- `password2`

contengan exactamente el mismo valor.

Si ambas contraseñas no coinciden, se genera un error asociado al campo `password2`.

## Transformación de datos

El esquema actualmente no realiza una transformación de los datos.

La eliminación de `password2` se realiza posteriormente en `validateUserRequest`, una vez que la validación mediante este esquema fue completada correctamente.

## Responsabilidad

La responsabilidad de este esquema es centralizar las reglas de validación relacionadas con el registro de usuarios.

De esta manera, los datos recibidos pueden ser validados antes de ser enviados a la lógica de negocio, manteniendo separadas las reglas de validación de la gestión posterior de la cuenta y de los archivos.

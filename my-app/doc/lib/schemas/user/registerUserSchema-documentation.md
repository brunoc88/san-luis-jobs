# registerUserSchema

## Descripción

Esquema de validación encargado de verificar los datos necesarios para el registro de nuevos usuarios.

La implementación utiliza Zod para validar la estructura, el formato y las reglas de negocio básicas antes de permitir la creación de una cuenta.

Además de validar los campos individuales, el esquema incorpora validaciones cruzadas entre propiedades y transforma el resultado final para exponer únicamente la información necesaria a las capas superiores.

## Campos validados

### Email

Valida que el campo:

- Exista.
- No se encuentre vacío.
- Posea un formato de correo electrónico válido.

### Username

Valida que el nombre de usuario:

- Exista.
- No se encuentre vacío.
- Posea un mínimo de 5 caracteres.
- No supere los 25 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

### Password

Valida que la contraseña:

- Exista.
- No se encuentre vacía.
- Posea un mínimo de 8 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

### Password Confirmation

Valida que el campo de confirmación:

- Exista.
- No se encuentre vacío.
- Posea un mínimo de 8 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

### Description

Valida que la descripción:

- Sea opcional.
- No supere los 150 caracteres.
- Elimine espacios innecesarios mediante `trim()`.

## Validación cruzada

Además de las validaciones individuales, el esquema incorpora una regla adicional mediante `refine`.

Esta validación garantiza que:

- `password`
- `password2`

contengan exactamente el mismo valor.

Si ambas contraseñas no coinciden, se genera un error asociado al campo `password2`.

## Transformación de datos

Una vez finalizada la validación, el esquema aplica una transformación sobre el resultado.

La propiedad:

```ts
password2
```

es eliminada antes de que los datos sean consumidos por las capas superiores.

El resultado final contiene únicamente:

```ts
{
  email,
  username,
  password,
  description
}
```

## Beneficios de la transformación

Este enfoque permite:

- Evitar transportar datos innecesarios.
- Reducir el riesgo de uso accidental de campos auxiliares.
- Simplificar los objetos utilizados por la capa de servicios.
- Mantener una separación clara entre validación y lógica de negocio.

## Responsabilidad

La responsabilidad de este esquema es centralizar todas las reglas de validación relacionadas con el registro de usuarios.

De esta manera, cualquier componente que utilice este esquema recibe datos consistentes, validados y listos para ser procesados por la lógica de negocio de la aplicación.

# Schema — changePasswordSchema

## Propósito

Valida los datos necesarios para cambiar la contraseña de un usuario.

El schema exige la contraseña actual, la nueva contraseña y una confirmación de la nueva contraseña.

## Campos

### `currentPassword`

Contraseña actual del usuario.

- Tipo: `string`
- Se aplica `trim()`.
- Mínimo: 8 caracteres.
- Es obligatorio.

Se utiliza posteriormente en el service para verificar la contraseña almacenada mediante `bcrypt.compare()`.

### `password`

Nueva contraseña.

- Tipo: `string`
- Se aplica `trim()`.
- Mínimo: 8 caracteres.
- Es obligatorio.

Se utiliza posteriormente para generar el nuevo hash mediante `bcrypt.hash()`.

### `password2`

Confirmación de la nueva contraseña.

- Tipo: `string`
- Se aplica `trim()`.
- Mínimo: 8 caracteres.
- Es obligatorio.

No se almacena ni se utiliza para generar el hash. Su función es comprobar que la nueva contraseña fue escrita correctamente.

## Regla de coincidencia

El schema utiliza `refine()` para comprobar:

```ts
data.password === data.password2
```

Si no coinciden, devuelve:

```text
Las contraseñas no coinciden
```

El error se asigna al campo `password2`.

## Flujo

```text
currentPassword ──→ validación
password ─────────→ validación ──→ comparación con password2
password2 ────────→ validación ──→ no se persiste
```

Una vez que la validación es exitosa, los datos pueden ser enviados al service `changePassword`.

## Responsabilidad

Este schema se encarga exclusivamente de validar la estructura, presencia, longitud y coincidencia de las contraseñas.

No verifica si `currentPassword` es realmente correcta ni genera hashes. Esas responsabilidades pertenecen al service.

# LoginSchema

## Descripción

Esquema de validación utilizado durante el proceso de autenticación mediante credenciales.

Valida los datos enviados por el usuario antes de intentar realizar el login.

Implementado utilizando Zod.

## Definición

```ts
const LoginSchema = z.object({
  user: z
    .string()
    .trim()
    .nonempty("Debe ingresar email o nombre de usuario"),

  password: z
    .string()
    .trim()
    .nonempty("Debe ingresar un password")
    .min(8, "Min 8 caracteres")
})
```

## Campos

### user

Representa el identificador utilizado para autenticarse.

Puede corresponder a:

- Nombre de usuario.
- Correo electrónico.

#### Validaciones

| Regla | Descripción |
|---------|-------------|
| string() | Debe ser una cadena de texto |
| trim() | Elimina espacios al inicio y final |
| nonempty() | Campo obligatorio |

### password

Representa la contraseña ingresada por el usuario.

#### Validaciones

| Regla | Descripción |
|---------|-------------|
| string() | Debe ser una cadena de texto |
| trim() | Elimina espacios al inicio y final |
| nonempty() | Campo obligatorio |
| min(8) | Debe contener al menos 8 caracteres |

## Ejemplo válido

```json
{
  "user": "bruno",
  "password": "password123"
}
```

## Ejemplo inválido

```json
{
  "user": "",
  "password": "123"
}
```

Errores esperados:

- Debe ingresar email o nombre de usuario.
- Min 8 caracteres.

## Uso

Se utiliza antes de ejecutar el proceso de autenticación para garantizar que los datos recibidos poseen el formato esperado.

## Beneficios

- Centraliza las reglas de validación del login.
- Evita solicitudes innecesarias a la base de datos.
- Proporciona mensajes de error consistentes.
- Mejora la experiencia del usuario mediante validaciones tempranas.

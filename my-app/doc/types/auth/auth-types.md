# Types - Authorization

## Descripción

Tipos utilizados durante el proceso de autenticación y autorización de usuarios.

Permiten tipar la información recibida durante el login y los datos retornados tras una autenticación exitosa.

---

## AuthorizeInput

Representa las credenciales recibidas durante el proceso de autenticación.

```ts
export type AuthorizeInput = {
    user: string
    password: string
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|------------|------|-------------|
| user | string | Nombre de usuario o correo electrónico utilizado para iniciar sesión |
| password | string | Contraseña proporcionada por el usuario |

### Uso

Se utiliza como entrada para procesos de autenticación mediante credenciales.

---

## AuthorizedUser

Representa la información mínima de un usuario autenticado correctamente.

```ts
export type AuthorizedUser = {
    id: number
    email: string
    username: string
    role: string
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|------------|------|-------------|
| id | number | Identificador único del usuario |
| email | string | Correo electrónico del usuario |
| username | string | Nombre de usuario |
| role | string | Rol asignado al usuario dentro de la aplicación |

### Uso

Se utiliza para:

- Construcción de sesiones.
- Creación de tokens.
- Procesos de autorización.
- Identificación del usuario autenticado.

## Reglas de diseño

- `AuthorizeInput` representa datos de entrada.
- `AuthorizedUser` representa datos ya validados y autorizados.
- Solo contiene la información necesaria para autenticación y autorización.
- No expone datos sensibles como contraseñas o hashes.

## Beneficios

- Centraliza los contratos utilizados por el sistema de autenticación.
- Mejora el tipado de funciones relacionadas con login.
- Evita el uso de objetos anónimos dispersos en la aplicación.

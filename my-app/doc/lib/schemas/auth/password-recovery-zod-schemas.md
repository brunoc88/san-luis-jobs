# Documentación - Esquemas de validación (Zod)

## Objetivo

Los esquemas de validación definen la estructura y las reglas que deben
cumplir los datos recibidos por los endpoints de autenticación
relacionados con la recuperación de contraseña.

Su objetivo es validar la información antes de que llegue a la lógica de
negocio.

------------------------------------------------------------------------

# `passwordRecoverySchema`

## Utilizado por

`POST /api/auth/forgot-password`

## Campos

### `email`

Debe cumplir las siguientes condiciones:

-   Ser una cadena de texto.
-   Tener un formato de correo electrónico válido.
-   No estar vacío.

### Mensajes de error

-   `email invalido`
-   `debe ingresar un email`

------------------------------------------------------------------------

# `newPasswordSchema`

## Utilizado por

`POST /api/auth/reset-password`

## Campos

### `password`

Debe:

-   Ser una cadena.
-   Eliminar espacios al inicio y al final (`trim()`).
-   Tener como mínimo 8 caracteres.
-   No estar vacío.

### `password2`

Se utiliza para confirmar la contraseña.

Debe cumplir exactamente las mismas reglas que `password`.

### `token`

Debe:

-   Ser una cadena.
-   No encontrarse vacío.

------------------------------------------------------------------------

## Validación adicional (`refine`)

Después de validar cada campo individualmente, el esquema verifica que:

``` text
password === password2
```

Si ambas contraseñas no coinciden, el error se asigna al campo:

``` text
password2
```

con el mensaje:

``` text
Las contraseñas no coinciden
```

------------------------------------------------------------------------

## Transformación (`transform`)

Una vez finalizada la validación, el esquema elimina el campo:

``` text
password2
```

De esta manera, la capa de negocio recibe únicamente:

``` ts
{
    password: string;
    token: string;
}
```

Esto evita transportar información innecesaria y simplifica el contrato
entre el controller y el `authService`.

------------------------------------------------------------------------

## Beneficios

-   Centraliza todas las reglas de validación.
-   Evita que datos inválidos lleguen a la lógica de negocio.
-   Genera mensajes de error consistentes.
-   Permite transformar el payload antes de utilizarlo.
-   Facilita la reutilización de los esquemas entre distintos endpoints.

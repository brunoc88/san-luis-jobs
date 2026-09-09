# UserAccountSearchSchema

## Descripción

`UserAccountSearchSchema` valida los parámetros de búsqueda utilizados para consultar listados de cuentas de usuarios.

El schema está construido con **Zod** y contempla dos parámetros opcionales:

- `page`: número de página.
- `search`: texto de búsqueda.

## Implementación

```ts
import { z } from "zod"

export const UserAccountSearchSchema = z.object({
    page: z.coerce
        .number('Debe ingresar un numero')
        .int("La página debe ser un número entero.")
        .positive("La página debe ser mayor a 0.")
        .default(1),

    search: z
        .string()
        .trim()
        .optional()
})
```

## Campos

### `page`

```ts
page: z.coerce
    .number('Debe ingresar un numero')
    .int("La página debe ser un número entero.")
    .positive("La página debe ser mayor a 0.")
    .default(1)
```

Valida el número de página solicitado.

- `z.coerce.number()` convierte el valor recibido, normalmente como string desde los query params, a `number`.
- `.int()` exige que sea un número entero.
- `.positive()` exige que sea mayor que `0`.
- `.default(1)` establece la página `1` cuando el parámetro no es enviado.

Ejemplos válidos:

```text
?page=1
?page=2
?page=10
```

Si no se proporciona `page`:

```text
GET /api/users/suspended
```

el valor resultante será:

```ts
{
    page: 1
}
```

Ejemplos inválidos:

```text
?page=0
?page=-1
?page=1.5
```

### `search`

```ts
search: z
    .string()
    .trim()
    .optional()
```

Representa el texto utilizado para realizar la búsqueda.

- `.string()` exige que el valor sea un string.
- `.trim()` elimina espacios al principio y al final.
- `.optional()` permite que el parámetro no sea enviado.

Ejemplo:

```text
?search=common
```

produce:

```ts
{
    search: "common"
}
```

Si no se proporciona:

```ts
{
    search: undefined
}
```

## Resultado

El schema devuelve los parámetros ya validados y transformados, listos para ser utilizados por la capa de servicio.

Ejemplo:

```text
?page=2&search= common
```

produce:

```ts
{
    page: 2,
    search: "common"
}
```

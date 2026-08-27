# Schema de paginación — `PageSchema`

El parámetro `page` llega desde los query parameters de la petición HTTP, por lo que inicialmente se recibe como **string**.

Para centralizar su validación se utiliza un esquema de Zod:

```ts
import { z } from "zod"

export const PageSchema = z.object({
    page: z.coerce
        .number("Debe ingresar un numero")
        .int("La página debe ser un número entero.")
        .positive("La página debe ser mayor a 0.")
        .default(1)
})
```

## ¿Qué hace el schema?

### `z.object()`

Define que los datos recibidos deben tener una propiedad llamada `page`.

### `z.coerce.number()`

Convierte el valor recibido a `number`.

Esto es importante porque un query parameter como:

```text
?page=2
```

llega inicialmente como:

```text
"2"
```

`z.coerce.number()` permite transformarlo en:

```text
2
```

para que el service trabaje con un número real.

### `.int()`

Exige que el número sea entero.

Por lo tanto:

```text
page=2      → válido
page=2.5    → inválido
```

### `.positive()`

Exige que el número sea mayor que cero.

Por lo tanto:

```text
page=1      → válido
page=5      → válido
page=0      → inválido
page=-1     → inválido
```

### `.default(1)`

Si `page` no se proporciona, Zod utiliza automáticamente `1`.

Por ejemplo:

```text
GET /api/feedback
```

se interpreta como:

```text
page = 1
```

Mientras que:

```text
GET /api/feedback?page=3
```

produce:

```text
page = 3
```

## Motivo de la validación

La validación evita que valores inválidos provenientes directamente del cliente lleguen al service.

El flujo queda:

**Query parameter → `PageSchema` → `number` validado → Service**

De esta forma, el service puede asumir que `page` ya cumple las reglas necesarias para realizar el cálculo de paginación.


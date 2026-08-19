# Feedback Register Schema

## Descripción

`FeedBackRegisterSchema` valida los datos recibidos al registrar una nueva opinión mediante `POST /api/feedback`.

El schema garantiza que la opinión:

- Sea un string.
- No esté vacía.
- No contenga espacios innecesarios al inicio o al final.
- Tenga como mínimo 10 caracteres.
- Tenga como máximo 500 caracteres.

## Schema

```ts
import { z } from "zod"

export const FeedBackRegisterSchema = z.object({
    opinion: z
        .string()
        .trim()
        .max(500, 'max 500 caracteres')
        .min(10, 'min 10 caracteres')
        .nonempty('debe ingresar una opinión')
})
```

## Campo `opinion`

### Tipo

```text
string
```

### Reglas

| Regla | Valor | Mensaje |
|---|---:|---|
| Obligatorio | Sí | `debe ingresar una opinión` |
| Mínimo | 10 caracteres | `min 10 caracteres` |
| Máximo | 500 caracteres | `max 500 caracteres` |
| Trim | Sí | — |

### Ejemplos válidos

```json
{
  "opinion": "La página es muy fácil de usar."
}
```

```json
{
  "opinion": "Estaría bueno agregar más filtros para las ofertas."
}
```

### Ejemplos inválidos

Opinión demasiado corta:

```json
{
  "opinion": "Muy bien"
}
```

Opinión vacía:

```json
{
  "opinion": ""
}
```

Opinión compuesta únicamente por espacios:

```json
{
  "opinion": "          "
}
```

Opinión superior a 500 caracteres:

```json
{
  "opinion": "..."
}
```

## Normalización mediante `trim()`

El uso de `.trim()` elimina los espacios al principio y al final del contenido antes de continuar con las siguientes validaciones.

Por ejemplo:

```text
"   La página funciona muy bien   "
```

se procesa como:

```text
"La página funciona muy bien"
```

Esto evita que los espacios externos sean considerados parte relevante de la opinión.

## Orden de las validaciones

La cadena de validación utiliza:

```text
string
  ↓
trim
  ↓
max 500
  ↓
min 10
  ↓
nonempty
```

El `.trim()` es especialmente importante porque permite que las validaciones de longitud se realicen sobre el contenido limpio.

## Consideración sobre `nonempty()`

`nonempty()` es ligeramente redundante en este schema porque `.min(10)` ya rechaza cualquier string con menos de 10 caracteres, incluyendo una cadena vacía.

Sin embargo, mantenerlo no genera un problema funcional y puede resultar útil como documentación explícita de la intención del campo.

Por lo tanto, **no es necesario modificar el schema actualmente**.

## Relación con el endpoint

Este schema se utiliza antes de ejecutar la lógica de negocio:

```text
POST /api/feedback
      ↓
requireSession()
      ↓
FeedBackRegisterSchema
      ↓
feedbackService.create()
      ↓
feedbackRepo.create()
```

El `userId` no forma parte del schema porque se obtiene de la sesión autenticada y no debe ser proporcionado por el cliente.

## Estado actual

- [x] Campo `opinion` obligatorio.
- [x] Tipo `string`.
- [x] Trim de espacios externos.
- [x] Mínimo de 10 caracteres.
- [x] Máximo de 500 caracteres.
- [x] Mensajes de validación definidos.

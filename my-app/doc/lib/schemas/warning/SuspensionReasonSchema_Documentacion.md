# Documentación - `SuspensionReasonSchema`

## Objetivo

Valida el cuerpo de la solicitud utilizado para suspender una
publicación de empleo.

## Implementación

``` ts
export const SuspensionReasonSchema = z.object({
    reason: z
        .string()
        .trim()
        .nonempty("debe ingresar una razon")
        .min(10, "El motivo debe tener al menos 10 caracteres.")
        .max(200, "El motivo no puede superar los 200 caracteres.")
})
```

## Campo

### reason

-   Tipo: `string`
-   Se eliminan espacios al inicio y al final (`trim()`).
-   Obligatorio.
-   Longitud mínima: **10** caracteres.
-   Longitud máxima: **200** caracteres.

## Responsabilidad

Validar que el administrador proporcione un motivo válido antes de
iniciar el proceso de suspensión de una publicación.

No aplica reglas de negocio; únicamente valida el formato de los datos
recibidos.

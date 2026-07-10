# Documentación - `parseId`

## Objetivo

`parseId` es una utilidad encargada de convertir y validar los
identificadores recibidos por parámetros de la URL.

Centraliza la validación de IDs para evitar repetir la misma lógica en
múltiples endpoints.

## Implementación

``` ts
export const parseId = (id: string): number => {
    const parsedId = Number(id)

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new BadRequestError("ID inválido.")
    }

    return parsedId
}
```

## Validaciones

La función verifica que el identificador:

-   Sea un número.
-   Sea un número entero.
-   Sea mayor que cero.

Si alguna condición no se cumple, lanza un `BadRequestError`.

## Casos de ejemplo

  Entrada   Resultado
  --------- ---------------------------
  `"5"`     Devuelve `5`
  `"1"`     Devuelve `1`
  `"0"`     Error (`400 Bad Request`)
  `"-1"`    Error (`400 Bad Request`)
  `"1.5"`   Error (`400 Bad Request`)
  `"abc"`   Error (`400 Bad Request`)
  `""`      Error (`400 Bad Request`)

## Responsabilidad

`parseId` únicamente valida y convierte identificadores provenientes de
la URL.

No consulta la base de datos ni verifica la existencia del recurso. Esa
responsabilidad pertenece a las funciones de dominio, como
`requireActiveJobById` o `requireActiveLocationById`.

## Beneficios

-   Evita código duplicado.
-   Mantiene un comportamiento consistente en todos los endpoints.
-   Simplifica el mantenimiento.
-   Produce respuestas de error uniformes para IDs inválidos.

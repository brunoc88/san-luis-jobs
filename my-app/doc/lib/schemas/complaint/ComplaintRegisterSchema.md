# Documentación - ComplaintRegisterSchema

## Descripción

`ComplaintRegisterSchema` valida el cuerpo de la solicitud utilizada
para registrar una denuncia sobre una publicación.

------------------------------------------------------------------------

## Estructura

  -----------------------------------------------------------------------------------
  Campo           Tipo                Obligatorio             Descripción
  --------------- ------------------- ----------------------- -----------------------
  `reason`        `ComplaintReason`   Sí                      Motivo de la denuncia.
                                                              Debe ser un valor
                                                              válido del enum
                                                              `ComplaintReason`.

  `explanation`   `string`            Condicional             Explicación adicional.
                                                              Es obligatoria
                                                              únicamente cuando el
                                                              motivo es `OTHER`.
  -----------------------------------------------------------------------------------

------------------------------------------------------------------------

## Validaciones

### reason

-   Debe pertenecer al enum `ComplaintReason`.
-   Si el valor no existe dentro del enum, se devuelve:

``` text
Denuncia inválida.
```

### explanation

Cuando se envía, debe cumplir:

-   Se eliminan espacios al inicio y al final (`trim()`).
-   Mínimo: **5 caracteres**.
-   Máximo: **150 caracteres**.

------------------------------------------------------------------------

## Regla de negocio

Se aplica una validación adicional mediante `refine()`.

La explicación solo es obligatoria cuando el motivo seleccionado es
`OTHER`.

Expresión utilizada:

``` ts
data.reason !== ComplaintReason.OTHER ||
data.explanation !== undefined
```

Esta condición significa:

-   Si el motivo **no** es `OTHER`, la validación es correcta aunque no
    exista explicación.
-   Si el motivo es `OTHER`, la explicación debe existir.

------------------------------------------------------------------------

## Casos válidos

  reason                explanation                Resultado
  --------------------- -------------------------- -----------
  `FALSE_INFORMATION`   No enviada                 ✅
  `FALSE_INFORMATION`   "Información adicional"    ✅
  `OTHER`               "Descripción del motivo"   ✅

------------------------------------------------------------------------

## Casos inválidos

  reason              explanation   Motivo
  ------------------- ------------- --------------------------------------------
  `OTHER`             No enviada    Debe especificar el motivo de la denuncia.
  `OTHER`             `"abc"`       Mínimo 5 caracteres.
  Valor inexistente   Cualquiera    Denuncia inválida.

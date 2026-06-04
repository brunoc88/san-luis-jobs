
# errorHandler

## Descripción

Función encargada de **centralizar el manejo de errores** dentro de las APIs.
Se utiliza en los controllers para transformar excepciones lanzadas desde
helpers, services o repositories en respuestas HTTP consistentes.

No es un middleware automático, sino un **handler manual** invocado dentro de `try/catch`.

---

## Implementación

```ts
import { AppError } from "@/error/appError"
import { NextResponse } from "next/server"

const errorHandler = (error: any) => {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    )
  }

  if (error.code === "P2002") {
    return NextResponse.json(
      { error: `El campo ${error.meta.target} ya está en uso` },
      { status: 409 }
    )
  }

  if (error.code === "P2025") {
    return NextResponse.json(
      { error: "Recurso no encontrado" },
      { status: 404 }
    )
  }

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  )
}

export default errorHandler
```

---

## Tipos de Errores Manejados

### Errores de Dominio (`AppError`)
- Detectados mediante `instanceof AppError`.
- El status HTTP se toma directamente de la clase.
- Casos comunes:
  - `BadRequestError` → 400
  - `UnAuthorizedError` → 401
  - `ForbiddenError` → 403
  - `NotFoundError` → 404

---

### Errores de Prisma

#### P2002 — Unique Constraint Failed
- Se produce cuando un campo único ya existe.
- Ejemplos:
  - Email duplicado
  - Username duplicado

Respuesta:
- **409 – Conflict**

---

#### P2025 — Record Not Found
- Se produce cuando una operación `update` o `delete` no encuentra el registro.
- Normalmente ocurre en:
  - `update`
  - `delete`
  - `updateMany`

Respuesta:
- **404 – Not Found**

> Puede coexistir con `NotFoundError` sin conflicto.

---

### Error Genérico

- Cualquier error no controlado explícitamente.
- Respuesta:
  - **500 – Internal Server Error**

---

## Flujo de Uso

```ts
try {
  // lógica del controller
} catch (error) {
  return errorHandler(error)
}
```

- Los services lanzan errores.
- El controller delega la respuesta al handler.
- Se mantiene separación de responsabilidades.

---

## Buenas Prácticas

- Evitar comparar `error.message`.
- Preferir clases de error para lógica de dominio.
- Mantener el handler libre de lógica de negocio.
- Documentar los errores manejados.

---

## Notas

- Este diseño facilita el testing de errores.
- Permite escalar agregando nuevos códigos de Prisma o errores de dominio.
- Compatible con arquitectura por capas.

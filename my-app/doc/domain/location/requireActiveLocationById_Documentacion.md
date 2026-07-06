# Documentación - requireActiveLocationById()

## Objetivo

`requireActiveLocationById()` es una función de dominio encargada de
verificar que una ubicación pueda utilizarse en una operación de
negocio.

No devuelve información; simplemente valida el estado de la ubicación y
lanza excepciones cuando corresponde.

------------------------------------------------------------------------

# Firma

``` ts
requireActiveLocationById(locationId: number): Promise<void>
```

------------------------------------------------------------------------

# Flujo de ejecución

## 1. Buscar la ubicación

``` ts
const location = await prisma.location.findUnique({
  where: { id: locationId }
})
```

Se consulta la ubicación por su identificador.

------------------------------------------------------------------------

## 2. Verificar existencia

Si la ubicación no existe:

``` ts
throw new NotFoundError()
```

Se interrumpe la operación con un error **404 Not Found**.

------------------------------------------------------------------------

## 3. Verificar estado

Si la ubicación existe pero está inactiva:

``` ts
throw new ForbiddenError("locacion inactiva")
```

Se responde con un **403 Forbidden**, ya que el recurso existe pero no
puede utilizarse.

------------------------------------------------------------------------

# Responsabilidad

La función encapsula una regla de negocio reutilizable:

> "Una ubicación solo puede utilizarse si existe y está activa."

Cualquier módulo que necesite esa garantía puede reutilizar esta
función.

------------------------------------------------------------------------

# ¿Por qué pertenece al Domain?

Esta validación no es exclusiva de `Job`.

En el futuro puede ser reutilizada por otros casos de uso que requieran
una ubicación válida, evitando duplicar lógica.

------------------------------------------------------------------------

# Decisiones de diseño

-   Devuelve `Promise<void>` porque su única responsabilidad es validar.
-   Utiliza excepciones para detener el flujo cuando la regla de negocio
    no se cumple.
-   Centraliza la validación en un único punto, facilitando el
    mantenimiento y la reutilización.

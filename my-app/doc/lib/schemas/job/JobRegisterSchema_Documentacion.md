# Documentación - JobRegisterSchema

## Objetivo

`JobRegisterSchema` valida la información recibida al crear un nuevo
empleo.

Se implementa con **Zod** y se utiliza antes de ejecutar cualquier
lógica de negocio, garantizando que únicamente datos válidos lleguen al
Service.

------------------------------------------------------------------------

# Validaciones

## title

**Tipo:** `string`

Reglas:

-   Elimina espacios al inicio y al final (`trim()`).
-   No puede estar vacío.
-   Mínimo: **10 caracteres**.
-   Máximo: **100 caracteres**.

## description

**Tipo:** `string`

Reglas:

-   Elimina espacios innecesarios.
-   No puede estar vacía.
-   Mínimo: **30 caracteres**.
-   Máximo: **5000 caracteres**.

## salary

**Tipo:** `number` (opcional)

Reglas:

-   Convierte automáticamente el valor recibido mediante
    `z.coerce.number()`.
-   Debe ser un número entero.
-   Debe ser mayor que cero.
-   Puede omitirse.

## applicationLimit

**Tipo:** `number` (opcional)

Reglas:

-   Conversión automática desde string.
-   Entero positivo.
-   Puede omitirse para indicar que el empleo no tiene límite de
    postulaciones.

## modality

**Tipo:** `JobModality`

Valores permitidos:

-   `remote`
-   `hybrid`
-   `onSite`

La validación utiliza `z.nativeEnum`, evitando valores no contemplados
por el modelo de Prisma.

## schedule

**Tipo:** `JobSchedule`

Valores permitidos:

-   `partTime`
-   `fullTime`

También se valida mediante `z.nativeEnum`.

## locationId

**Tipo:** `number`

Reglas:

-   Conversión automática mediante `coerce`.
-   Debe ser un entero positivo.

Posteriormente, durante la lógica de negocio, se verifica además que la
ubicación exista y esté activa.

------------------------------------------------------------------------

# Decisiones de diseño

-   La validación sintáctica pertenece al Schema.
-   La validación de reglas de negocio (por ejemplo, comprobar que una
    ubicación exista) pertenece al Service/Domain.
-   `salary` y `applicationLimit` son opcionales para permitir empleos
    sin salario publicado o sin límite de postulaciones.
-   Se utilizan los enums generados por Prisma para mantener
    sincronizados el modelo de datos y las validaciones.

------------------------------------------------------------------------

# Campos no incluidos

Los siguientes atributos no son enviados por el cliente y, por lo tanto,
no forman parte del Schema:

-   `id`
-   `createdAt`
-   `userId`
-   `state`
-   `isActive`
-   `isSuspended`

Estos valores son gestionados automáticamente por el backend.

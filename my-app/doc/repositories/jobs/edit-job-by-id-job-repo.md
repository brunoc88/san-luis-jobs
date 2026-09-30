# Documentación - `jobRepo.editJobById`

## Objetivo

Actualizar un Job existente en la base de datos utilizando los datos proporcionados por el Service.

La función delega directamente la operación de persistencia a Prisma.

---

## Firma

```ts
editJobById: async (id: number, data: EditJobData) => {
    await prisma.job.update({ data, where: { id } })
}
```

---

## Parámetros

### `id`

Tipo: `number`

Identificador del Job que se desea actualizar.

### `data`

Tipo: `EditJobData`

Contiene los datos que deben actualizarse en el Job.

Estos datos son preparados previamente por el Service de acuerdo con las reglas de negocio correspondientes.

El Repository no modifica ni valida estos datos antes de enviarlos a Prisma.

---

## Flujo de ejecución

1. Recibe el identificador del Job.
2. Recibe los datos de actualización.
3. Delega la operación a `prisma.job.update()`.
4. Prisma actualiza el registro correspondiente en la base de datos.

```ts
await prisma.job.update({
    data,
    where: { id }
})
```

---

## Retorno

La función no devuelve el Job actualizado.

Su ejecución finaliza una vez que Prisma completa correctamente la operación de actualización.

---

## Manejo de errores

El Repository no realiza un manejo específico de errores.

Si Prisma genera una excepción durante la operación, esta se propaga hacia las capas superiores para que sea gestionada por el Service y/o el mecanismo centralizado de manejo de errores.

---

## Responsabilidades

- Actualizar un Job existente.
- Delegar la operación de actualización a Prisma.
- Propagar los errores producidos durante la persistencia.

No contiene reglas de negocio ni validaciones de entrada. Estas responsabilidades pertenecen a las capas superiores correspondientes.

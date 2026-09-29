# Documentación - `jobRepo.create`

## Objetivo

Crear un nuevo empleo en la base de datos utilizando los datos proporcionados por el Service.

La función delega directamente la operación de persistencia a Prisma.

---

## Firma

```ts
create: async (data: CreateJobData): Promise<Job> => {
    return await prisma.job.create({ data })
},
```

---

## Parámetros

### `data`

Tipo: `CreateJobData`

Contiene los datos necesarios para crear el empleo.

Los datos recibidos son construidos previamente por el `jobService` a partir de la información validada y de las reglas de negocio correspondientes.

El Repository no modifica ni valida estos datos antes de enviarlos a Prisma.

---

## Flujo de ejecución

1. Recibe un objeto `CreateJobData`.
2. Delega la creación a `prisma.job.create()`.
3. Prisma persiste el nuevo empleo en la base de datos.
4. Devuelve el registro `Job` creado.

```ts
return await prisma.job.create({ data })
```

---

## Retorno

La función devuelve una entidad `Job` correspondiente al empleo recién creado.

```ts
Promise<Job>
```

El `id` generado por la base de datos queda disponible en el objeto retornado y es utilizado posteriormente por el Service.

---

## Manejo de errores

El Repository no realiza un manejo específico de errores.

Si Prisma genera una excepción durante la operación, esta se propaga hacia las capas superiores para que sea gestionada por el Service y/o el mecanismo centralizado de manejo de errores.

---

## Responsabilidades

- Persistir un nuevo empleo.
- Delegar la operación de creación a Prisma.
- Devolver el empleo creado.

No contiene reglas de negocio ni validaciones de entrada. Estas responsabilidades pertenecen a las capas superiores correspondientes.

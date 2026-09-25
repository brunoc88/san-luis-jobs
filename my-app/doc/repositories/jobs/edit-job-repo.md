# Documentación — `jobRepo.editJobById`

## Responsabilidad

`editJobById` es el método del repository encargado exclusivamente de persistir en la base de datos los cambios de un Job.

No contiene lógica de negocio ni validaciones relacionadas con permisos, estados o límites de postulantes.

## Firma

```ts
editJobById: async (
    id: number,
    data: EditJobData
)
```

### Parámetros

- `id`: identificador del Job que se desea modificar.
- `data`: objeto con los campos que deben actualizarse.

## Persistencia

La actualización se realiza mediante Prisma:

```ts
await prisma.job.update({
    data,
    where: { id }
})
```

Prisma localiza el registro mediante su `id` y aplica los datos recibidos.

## Separación de responsabilidades

El repository no verifica:

- si el usuario está autenticado o activo;
- si el usuario es el autor del Job;
- si el Job puede ser editado;
- si el nuevo `applicationLimit` es válido;
- si el Job está activo, pausado o finalizado;
- qué campos puede modificar el usuario.

Estas reglas pertenecen a las capas superiores, principalmente al service.

El repository recibe los datos ya validados y se limita a ejecutar la operación de persistencia.

## Relación con `editJob`

El flujo completo queda:

```text
Controller
    │
    │ valida request
    ▼
Service: editJob
    │
    ├── verifica usuario activo
    ├── verifica autoría
    ├── obtiene cantidad de postulantes
    ├── valida applicationLimit
    └── prepara los datos para persistencia
            │
            ▼
Repository: editJobById
    │
    └── prisma.job.update()
```

## Código actual

```ts
editJobById: async (id: number, data: EditJobData) => {
    await prisma.job.update({
        data,
        where: { id }
    })
}
```

## Resultado

El método no devuelve el Job actualizado. Su responsabilidad actual es ejecutar correctamente la actualización.

Si `prisma.job.update()` falla, el error se propaga hacia las capas superiores para ser manejado por el flujo de errores correspondiente.

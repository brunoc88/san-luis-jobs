# Documentación — `jobService.editJob`

## Responsabilidad

`editJob` contiene la lógica de negocio para modificar un Job existente.

Su responsabilidad principal es verificar que el usuario pueda realizar la operación y aplicar las reglas relacionadas con el límite de postulantes antes de delegar la persistencia al repository.

## Firma

```ts
editJob: async (
    id: number,
    jobId: number,
    data: EditJobDto
)
```

### Parámetros

- `id`: identificador del usuario que solicita la edición.
- `jobId`: identificador del Job a modificar.
- `data`: datos validados del Job que se desea actualizar.

## Flujo de negocio

### 1. Verificar que el usuario esté activo

Se utiliza:

```ts
const user = await requireActiveUserById(id)
```

La operación solamente puede continuar si el usuario existe y se encuentra activo.

### 2. Obtener el Job

```ts
const job = await requireActiveJobById(jobId)
```

Se obtiene el Job y se valida su existencia mediante el helper correspondiente.

Aunque el nombre del helper sea `requireActiveJobById`, la edición contempla los estados de publicación definidos por la aplicación según las reglas actuales del dominio.

### 3. Verificar autoría

```ts
if (user.id !== job.autorId) {
    throw new ForbiddenError()
}
```

Solamente el usuario creador del Job puede modificarlo.

Si otro usuario intenta editarlo, se devuelve `ForbiddenError`.

### 4. Obtener cantidad actual de postulantes

```ts
const jobApplicants = await applicationRepo.count(job.id)
```

La cantidad actual de postulaciones es necesaria para validar un nuevo límite de postulantes.

### 5. Validar `applicationLimit`

La regla de negocio es:

> Si el Job está activo y se establece un límite, el nuevo límite debe ser mayor que la cantidad actual de postulantes.

La condición aplicada es:

```ts
if (
    job.state === JobState.active &&
    data.applicationLimit !== undefined &&
    data.applicationLimit <= jobApplicants
) {
    throw new BadRequestError(
        "El límite de postulantes no puede ser menor o igual a la cantidad de postulantes actuales."
    )
}
```

Por lo tanto, si existen 10 postulantes y el Job está activo:

| Nuevo límite | Resultado |
|---:|---|
| 5 | Rechazado |
| 9 | Rechazado |
| 10 | Rechazado |
| 11 | Permitido |
| 20 | Permitido |
| `undefined` | Permitido; elimina el límite |

La comparación utiliza `<=` porque un límite igual a la cantidad actual de postulantes ya fue alcanzado.

### 6. Persistencia de campos opcionales

Antes de persistir los cambios se transforman los campos opcionales:

```ts
await jobRepo.editJobById(job.id, {
    ...data,
    applicationLimit: data.applicationLimit ?? null,
    salary: data.salary ?? null
})
```

La semántica definida para la edición es:

```text
applicationLimit = número → establece/modifica el límite
applicationLimit = undefined → elimina el límite → null

salary = número → establece/modifica el salario
salary = undefined → elimina el salario → null
```

El `?? null` permite convertir explícitamente la ausencia del valor en `null` para la base de datos.

## Estados del Job

### Job activo

Puede modificar sus datos y el límite de postulantes, siempre que el nuevo límite sea mayor que la cantidad actual de postulantes.

También puede eliminar el límite.

### Job pausado

Puede modificar los datos y el límite sin aplicar la restricción específica de un Job activo.

### Job finalizado

Puede modificar los datos y el límite sin aplicar la restricción específica de un Job activo.

La posibilidad de volver a activar un Job y las condiciones para hacerlo pertenecen a `changeJobStatus`, no a `editJob`.

## Separación de responsabilidades

`editJob` no modifica el estado del Job.

El estado se administra mediante la operación específica de cambio de estado.

La finalización automática al alcanzar el límite durante una postulación pertenece a `applyJob`.

## Código actual

```ts
editJob: async (id: number, jobId: number, data: EditJobDto) => {

    const user = await requireActiveUserById(id)

    const job = await requireActiveJobById(jobId)

    if (user.id !== job.autorId) {
        throw new ForbiddenError()
    }

    const jobApplicants = await applicationRepo.count(job.id)

    // Si el Job está activo y se establece un límite,
    // el nuevo límite debe ser mayor a la cantidad actual de postulantes.
    if (
        job.state === JobState.active &&
        data.applicationLimit !== undefined &&
        data?.applicationLimit <= jobApplicants
    ) {
        throw new BadRequestError(
            "El límite de postulantes no puede ser menor o igual a la cantidad de postulantes actuales."
        )
    }

    await jobRepo.editJobById(job.id, {
        ...data,
        applicationLimit: data.applicationLimit ?? null,
        salary: data.salary ?? null
    })
}
```

## Relación con otras operaciones

```text
editJob
  │
  ├── verifica usuario activo
  ├── verifica autoría
  ├── valida applicationLimit
  └── jobRepo.editJobById()

applyJob
  └── al alcanzar applicationLimit → finaliza el Job

changeJobStatus
  └── controla las condiciones para cambiar/reactivar el estado
```

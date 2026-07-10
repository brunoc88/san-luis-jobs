# Documentación - CreateJobDto

## Objetivo

`CreateJobDto` define la estructura de datos que el Service espera
recibir para crear un nuevo empleo.

No realiza validaciones; únicamente aporta tipado mediante TypeScript.

## Definición

``` ts
export type CreateJobDto = {
    title: string,
    description: string,
    salary: number | null,
    applicationLimit: number | null,
    modality: JobModality,
    schedule: JobSchedule,
    locationId: number
}
```

## Propiedades

-   **title:** título del empleo.
-   **description:** descripción del puesto.
-   **salary:** salario o `null` si no se publica.
-   **applicationLimit:** límite de postulaciones o `null` para
    ilimitado.
-   **modality:** `remote`, `hybrid` o `onSite`.
-   **schedule:** `partTime` o `fullTime`.
-   **locationId:** identificador de la ubicación.

## Campos no incluidos

Estos campos son administrados por el backend:

-   id
-   userId
-   createdAt
-   state
-   isActive
-   isSuspended

## Flujo

Cliente → JobRegisterSchema → CreateJobDto → jobService.create() →
Repository → Base de datos

## Responsabilidad

Representar los datos necesarios para crear un empleo dentro de la capa
Service, aportando tipado fuerte y desacoplando la lógica de negocio del
Request HTTP.

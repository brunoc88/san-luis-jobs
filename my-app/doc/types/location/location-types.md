# Types - Location

## Descripción

Tipos de dominio utilizados para representar locaciones dentro de la aplicación.

Estos tipos abstraen los modelos de persistencia y permiten que los servicios trabajen con estructuras propias del dominio.

---

## Location

Representa una locación individual.

```ts
export type Location = {
    id: number
    name: string
    isActive: boolean
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|------------|------|-------------|
| id | number | Identificador único de la locación |
| name | string | Nombre de la locación |
| isActive | boolean | Indica si la locación se encuentra activa o desactivada |

---

## Locations

Colección de locaciones.

```ts
export type Locations = Location[]
```

### Uso

Se utiliza en operaciones que retornan múltiples locaciones.

Ejemplos:

- Obtener todas las locaciones.
- Obtener locaciones activas.
- Listados administrativos.

## Beneficios

- Centraliza la definición de estructuras de datos.
- Desacopla los servicios de los modelos generados por Prisma.
- Facilita cambios futuros en la representación de los datos.

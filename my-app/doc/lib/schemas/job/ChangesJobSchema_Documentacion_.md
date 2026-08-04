# Documentación - ChangesJobSchema

## Descripción

`ChangesJobSchema` valida el cuerpo de la solicitud utilizado para cambiar el estado de una publicación.

Se implementa con **Zod** y utiliza el enum `JobState` de Prisma para garantizar que únicamente se acepten estados válidos.

## Estructura

```ts
{
  state: JobState
}
```

## Campo

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `state` | `JobState` | Sí | Nuevo estado de la publicación. |

## Valores permitidos

- `active`
- `paused`
- `finished`

Cualquier otro valor produce un error de validación.

## Error de validación

Si `state` no pertenece al enum `JobState`, Zod devuelve:

```text
Estado inválidao.
```


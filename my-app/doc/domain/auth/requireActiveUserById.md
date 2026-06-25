# requireActiveUserById()

## Descripción

Función de dominio encargada de validar que un usuario exista y se encuentre activo.

Es utilizada como paso previo en operaciones protegidas para garantizar que las acciones sean ejecutadas únicamente por usuarios válidos.

## Firma

```ts
requireActiveUserById(userId: number)
```

## Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| userId | number | Identificador del usuario a validar |

## Flujo

1. Consulta el usuario en la base de datos mediante su identificador.
2. Verifica que el usuario exista.
3. Verifica que el usuario se encuentre activo.
4. Retorna únicamente los datos necesarios para operaciones posteriores.

## Retorno

```ts
{
    id: number
    role: string
}
```

Actualmente retorna:

| Campo | Descripción |
|---------|-------------|
| id | Identificador del usuario |
| role | Rol asignado al usuario |

La función no expone información innecesaria del usuario.

## Reglas de negocio

- El usuario debe existir en la base de datos.
- El usuario debe encontrarse activo.
- Los usuarios inactivos no pueden ejecutar operaciones protegidas.
- Solo se retornan los datos mínimos necesarios para autorización.

## Posibles errores

| Error | Descripción |
|---------|-------------|
| NotFoundError | El usuario no existe |
| ForbiddenError | El usuario se encuentra inactivo |
| InternalServerError | Error inesperado durante la consulta |

## Casos de uso

Ejemplos de utilización:

- Creación de locaciones.
- Modificación de locaciones.
- Activación o desactivación de locaciones.
- Creación de empleos.
- Postulación a empleos.
- Operaciones protegidas que requieren un usuario válido.

## Notas de diseño

Esta función centraliza la validación de existencia y estado del usuario, evitando duplicar lógica en los distintos servicios de la aplicación.

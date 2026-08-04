# Documentación - jobService.changeJobStatus()

## Descripción

Permite cambiar el estado de una publicación siempre que el usuario autenticado sea su autor y se cumplan las reglas de negocio.

## Firma

```ts
changeJobStatus(
    userId: number,
    jobId: number,
    state: JobState
): Promise<void>
```

## Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `userId` | number | Identificador del usuario autenticado. |
| `jobId` | number | Identificador de la publicación. |
| `state` | `JobState` | Nuevo estado de la publicación. |

## Flujo

1. Verifica que el usuario exista y esté activo (`requireActiveUserById`).
2. Verifica que la publicación exista y esté activa (`requireActiveJobById`).
3. Comprueba que el usuario autenticado sea el autor de la publicación.
4. Si la publicación se encuentra en estado `finished`:
   - Obtiene información adicional de la publicación.
   - Verifica si posee un límite de postulaciones.
   - Cuenta la cantidad actual de postulaciones.
   - Si el límite fue alcanzado o superado, impide el cambio de estado.
5. Si todas las validaciones son correctas, actualiza el estado de la publicación mediante el repositorio.

## Reglas de negocio

- Sólo el autor puede cambiar el estado de su publicación.
- No es posible reactivar o pausar una publicación finalizada cuando ya alcanzó el límite de postulaciones configurado.
- Para volver a habilitar la publicación en ese caso, primero debe aumentarse el límite de postulantes.

## Posibles excepciones

| Excepción | Motivo |
|-----------|--------|
| `ForbiddenError` | El usuario no es el autor de la publicación. |
| `BadRequestError` | La publicación alcanzó el límite de postulaciones y no puede cambiar de estado hasta aumentar dicho límite. |

## Responsabilidad

Este método concentra toda la lógica de negocio relacionada con el cambio de estado de una publicación. Las operaciones de persistencia son delegadas al repositorio (`jobRepo`), manteniendo separadas las responsabilidades entre la capa de negocio y el acceso a datos.

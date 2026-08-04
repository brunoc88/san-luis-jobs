# Documentación - Cambiar estado de una publicación

## Endpoint

**PATCH** `/api/jobs/:id/state`

Permite al autor de una publicación cambiar su estado.

## Autenticación

Requiere una sesión válida mediante `requireSession()`.

## Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | Identificador de la publicación. |

## Body

```json
{
  "state": "active"
}
```

### Estados permitidos

- `active`
- `paused`
- `finished`

La validación del body se realiza con Zod (`ChangesJobSchema`), por lo que únicamente se aceptan los valores definidos en `JobState`.

## Flujo del endpoint

1. Verifica que el usuario tenga una sesión activa.
2. Obtiene y valida el `id` de la publicación.
3. Valida el cuerpo de la petición con `ChangesJobSchema`.
4. Si la validación falla, responde **400 Bad Request**.
5. Invoca `jobService.changeJobStatus(userId, jobId, state)`.
6. Si la operación finaliza correctamente, responde **200 OK**.

## Respuesta exitosa

```json
{
  "ok": true
}
```

## Posibles errores

| Código | Motivo |
|---------|--------|
| 400 | El cuerpo de la solicitud es inválido. |
| 401 | El usuario no está autenticado. |
| 403 | El usuario no es el autor de la publicación. |
| 404 | La publicación no existe o está inactiva. |

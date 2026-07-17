# POST /api/jobs/:id/save

Guarda una publicación de empleo en la lista de favoritos del usuario autenticado.

## Autenticación

Requiere un usuario autenticado.

## Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `number` | ID de la publicación que se desea guardar. |

## Respuesta exitosa

**Código:** `201 Created`

```json
{
  "ok": true
}
```

## Posibles respuestas de error

| Código | Motivo |
|---------|--------|
| `400` | El ID de la publicación no es válido. |
| `401` | El usuario no ha iniciado sesión. |
| `403` | El usuario intenta guardar su propia publicación o la publicación no puede ser guardada por las reglas de negocio. |
| `404` | La publicación no existe o no se encuentra disponible. |
| `409` | La publicación ya se encuentra guardada por el usuario. |

## Flujo

1. Verifica que exista una sesión activa.
2. Obtiene y valida el parámetro `id`.
3. Delega la lógica de negocio al servicio `jobService.saveJob`.
4. Retorna `201 Created` cuando la publicación se guarda correctamente.
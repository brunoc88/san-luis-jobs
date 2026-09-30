# Documentación - DELETE /api/jobs/:id

## Objetivo

Permite que el autor elimine lógicamente una publicación de empleo.

## Rate Limit

El endpoint aplica un límite de solicitudes por usuario autenticado.

- **Límite:** 10 solicitudes.
- **Ventana:** 1 hora.
- **Criterio:** `userId`.
- **Clave:** `delete-job:user:${userId}`.
- Cuando el usuario supera el límite, el endpoint responde con `429 Too Many Requests`.

El límite se aplica después de verificar la sesión y validar el ID de la publicación, antes de ejecutar `jobService.deleteJob()`.

## Flujo

1. Verificar la sesión mediante `requireSession()`.

2. Obtener y validar el parámetro `id` utilizando `parseId()`.

3. Aplicar el rate limit correspondiente al usuario autenticado.

4. Delegar la lógica de negocio a `jobService.deleteJob()`.

5. Responder `200 OK` si la operación finaliza correctamente.

## Responsabilidades

- Verificar autenticación.

- Validar el identificador recibido.

- Aplicar el rate limit correspondiente al usuario autenticado.

- Delegar la lógica de negocio al Service.

- Devolver la respuesta HTTP correspondiente.

## Regla de negocio

- Solo el autor puede eliminar su propia publicación.

- La eliminación es lógica (soft delete).

- El estado del empleo (`active`, `paused` o `completed`) no impide su
  eliminación por parte del autor.

- La suspensión de publicaciones por parte de administradores
  pertenece a otro endpoint.

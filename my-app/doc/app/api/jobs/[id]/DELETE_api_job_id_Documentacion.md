# Documentación - DELETE /api/jobs/:id

## Objetivo

Permite que el autor elimine lógicamente una publicación de empleo.

## Flujo

1.  Verificar la sesión mediante `requireSession()`.
2.  Obtener y validar el parámetro `id` utilizando `parseId()`.
3.  Delegar la lógica de negocio a `jobService.deleteJob()`.
4.  Responder `200 OK` si la operación finaliza correctamente.

## Responsabilidades

-   Verificar autenticación.
-   Validar el identificador recibido.
-   Delegar la lógica de negocio al Service.
-   Devolver la respuesta HTTP correspondiente.

## Regla de negocio

-   Solo el autor puede eliminar su propia publicación.
-   La eliminación es lógica (soft delete).
-   El estado del empleo (`active`, `paused` o `completed`) no impide su
    eliminación por parte del autor.
-   La suspensión de publicaciones por parte de administradores
    pertenece a otro endpoint.

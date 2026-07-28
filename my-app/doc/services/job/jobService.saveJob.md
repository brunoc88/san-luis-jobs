# jobService.saveJob(userId, jobId)

Guarda una publicación en la lista de favoritos del usuario autenticado.

## Parámetros

  Parámetro   Tipo       Descripción
  ----------- ---------- --------------------------------------------
  `userId`    `number`   ID del usuario autenticado.
  `jobId`     `number`   ID de la publicación que se desea guardar.

## Retorno

`Promise<void>`

## Flujo

1.  Obtiene y valida que el usuario exista y se encuentre activo
    mediante `requireActiveUserById`.
2.  Obtiene y valida que la publicación exista, se encuentre activa y no
    esté suspendida mediante `requireActiveJobById`.
3.  Verifica que el usuario no sea el autor de la publicación.
4.  Verifica que la publicacion este finalizada.
5.  Construye el DTO `SaveJobDto`.
6.  Delega la persistencia al repositorio `jobRepo.saveJob`.

## Reglas de negocio

-   Solo los usuarios activos pueden guardar publicaciones.
-   Solo pueden guardarse publicaciones activas y no suspendidas.
-   Un usuario no puede guardar una publicación de su autoría.
-   Una publicación solo puede guardarse una vez por usuario. Esta
    restricción es garantizada por la clave compuesta (`@@id` o
    `@@unique`) del modelo `SavedJob`, devolviendo un `409 Conflict` en
    caso de duplicado.

## Excepciones

  -----------------------------------------------------------------------
  Excepción                                 Motivo
  ----------------------------------------- -----------------------------
  `NotFoundError`                           El usuario o la publicación
                                            no existen.

  `ForbiddenError`                          El usuario intenta guardar
                                            una publicación propia o la
                                            publicación no está
                                            disponible.

  `409 Conflict`                            La publicación ya fue
                                            guardada previamente por el
                                            usuario.
  -----------------------------------------------------------------------

# Documentación - jobService.unsaveJob()

## Descripción

El método `unsaveJob()` elimina una publicación de la lista de
publicaciones guardadas por un usuario.

Toda la lógica de negocio relacionada con la eliminación de
publicaciones guardadas se concentra en este servicio.

------------------------------------------------------------------------

## Parámetros

  ------------------------------------------------------------------------
  Parámetro                  Tipo           Descripción
  -------------------------- -------------- ------------------------------
  `userId`                   `number`       Identificador del usuario
                                            autenticado.

  `jobId`                    `number`       Identificador de la
                                            publicación que se desea
                                            eliminar de la lista de
                                            guardados.
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## Flujo de ejecución

1.  Verifica que el usuario exista y se encuentre activo mediante
    `requireActiveUserById()`.
2.  Consulta si la publicación se encuentra guardada por el usuario
    utilizando `jobRepo.getSavedJob()`.
3.  Si la publicación no está guardada, lanza una excepción
    `NotFoundError`.
4.  Si existe, elimina el registro mediante `jobRepo.removeSavedJob()`.

------------------------------------------------------------------------

## Reglas de negocio

### El usuario debe existir y estar activo

Antes de realizar cualquier operación se valida que el usuario exista y
se encuentre activo.

------------------------------------------------------------------------

### La publicación debe encontrarse guardada

No es posible eliminar una publicación que el usuario no haya guardado
previamente.

En ese caso se lanza:

``` text
NotFoundError
```

------------------------------------------------------------------------

## Persistencia

La eliminación de la relación entre el usuario y la publicación se
delega al repositorio:

``` ts
await jobRepo.removeSavedJob(userId, jobId)
```

------------------------------------------------------------------------

## Valor de retorno

``` ts
Promise<void>
```

El método no retorna información. Si finaliza correctamente, la
publicación deja de formar parte de la lista de publicaciones guardadas
del usuario.

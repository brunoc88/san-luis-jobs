# Documentación del Endpoint

# DELETE `/api/jobs/:id/save`

## Descripción

Permite a un usuario autenticado eliminar una publicación de su lista de
publicaciones guardadas.

------------------------------------------------------------------------

## Autenticación

Requiere una sesión válida.

------------------------------------------------------------------------

## Parámetros de la ruta

  ------------------------------------------------------------------------
  Parámetro                  Tipo           Descripción
  -------------------------- -------------- ------------------------------
  `id`                       `number`       Identificador de la
                                            publicación que se desea
                                            quitar de la lista de
                                            guardados.

  ------------------------------------------------------------------------

------------------------------------------------------------------------

## Flujo del endpoint

1.  Verifica que el usuario tenga una sesión activa mediante
    `requireSession()`.
2.  Obtiene el parámetro `id` de la URL.
3.  Convierte el identificador utilizando `parseId()`.
4.  Delega la lógica de negocio al servicio
    `jobService.unsaveJob(userId, jobId)`.
5.  Si la operación finaliza correctamente, responde con **200 OK**.

------------------------------------------------------------------------

## Respuesta exitosa

### 200 OK

``` json
{
  "ok": true
}
```

------------------------------------------------------------------------

## Errores

Los errores son gestionados por `errorHandler()` y pueden originarse en
el servicio, por ejemplo:

-   Usuario inexistente o inactivo.
-   Publicación inexistente o inactiva.
-   La publicación no se encontraba guardada por el usuario.

------------------------------------------------------------------------

## Responsabilidades del endpoint

Este endpoint únicamente se encarga de:

-   Autenticar al usuario.
-   Obtener y validar el identificador de la publicación.
-   Delegar la lógica de negocio al servicio.
-   Devolver la respuesta HTTP correspondiente.

Toda la lógica relacionada con la eliminación de publicaciones guardadas
se implementa en `jobService.unsaveJob()`.

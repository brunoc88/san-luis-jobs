# POST /api/jobs/:id/apply

## Descripción

Permite que un usuario autenticado se postule a una publicación de
empleo.

## Endpoint

``` http
POST /api/jobs/:id/apply
```

## Autenticación

Requiere sesión activa.

## Parámetros

  Parámetro   Tipo       Descripción
  ----------- ---------- -----------------------
  `id`        `number`   ID de la publicación.

## Flujo

1.  Verifica que el usuario esté autenticado.
2.  Valida el ID de la publicación.
3.  Ejecuta `jobService.applyJob(userId, jobId)`.
4.  Si todo es correcto, registra la postulación y devuelve éxito.

## Respuesta exitosa

**201 Created**

``` json
{
  "ok": true
}
```

## Posibles errores

  -----------------------------------------------------------------------
  Código                                Motivo
  ------------------------------------- ---------------------------------
  400                                   Usuario sin CV o límite de
                                        postulaciones alcanzado.

  401                                   Usuario no autenticado.

  403                                   Publicación no disponible o
                                        intento de postularse a una
                                        publicación propia.

  404                                   Publicación o usuario
                                        inexistente/inactivo.

  409                                   El usuario ya se encuentra
                                        postulado a la publicación.
  -----------------------------------------------------------------------


```

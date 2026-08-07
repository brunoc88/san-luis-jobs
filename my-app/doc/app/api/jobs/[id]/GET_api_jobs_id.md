# GET /api/jobs/:id

Obtiene la información detallada de una publicación. Si el usuario está
autenticado, la respuesta incluye información personalizada.

## Endpoint

`GET /api/jobs/:id`

## Autenticación

-   **Opcional**.
-   Sin sesión: devuelve únicamente la información pública del empleo.
-   Con sesión: además devuelve si el usuario ya se postuló y, cuando
    corresponde, la cantidad de postulantes.

## Parámetros de ruta

  Parámetro   Tipo     Descripción
  ----------- -------- -----------------------
  `id`        number   ID de la publicación.

## Respuesta exitosa (200)

``` json
{
  "ok": true,
  "job": {
    "id": 1,
    "author": {
      "username": "admin1",
      "pic": "fakepic.png"
    },
    "title": "Backend Node.js Junior",
    "state": "active",
    "date": "2026-08-07T14:45:43.841Z",
    "location": {
      "name": "Villa Mercedes"
    },
    "schedule": "fullTime",
    "modality": "remote",
    "salary": 1800000,
    "description": "Buscamos desarrollador backend con conocimientos en Node.js, Express y PostgreSQL.",
    "alreadyApplied": false,
    "numberOfApplicants": 0
  }
}
```

## Comportamiento

### Sin sesión

Se devuelve únicamente la información pública del empleo.

### Con sesión

Además de la información pública: - `alreadyApplied`: indica si el
usuario autenticado ya se postuló. - `numberOfApplicants`: se incluye
únicamente cuando la publicación tiene un límite de postulaciones
configurado.

## Posibles respuestas de error

    Código Descripción
  -------- ------------------------------------------------
       400 ID inválido.
       401 Error de autenticación (si corresponde).
       404 La publicación no existe o no está disponible.
       500 Error interno del servidor.

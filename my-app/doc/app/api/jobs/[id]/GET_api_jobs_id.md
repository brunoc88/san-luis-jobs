# GET /api/jobs/:id

Obtiene la información detallada de una publicación. Si el usuario está
autenticado, la respuesta incluye información personalizada.

## Endpoint

`GET /api/jobs/:id`

## Autenticación

- **Opcional**.
- Sin sesión: devuelve únicamente la información pública del empleo.
- Con sesión: además devuelve si el usuario ya se postuló y, cuando
  corresponde, la cantidad de postulantes.

## Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | number | ID de la publicación. |

## Rate Limit

El endpoint utiliza rate limiting por IP debido a que es un endpoint público.

- **Límite:** 60 solicitudes por minuto.
- **Ventana:** 1 minuto.
- **Clave:** `job-details:ip:${clientIp}`
- Si se supera el límite, responde con `429 Too Many Requests`.

El rate limit se aplica antes de ejecutar la lógica del servicio.

## Controller

El controller recibe el `Request` para poder obtener la IP del cliente mediante
`getClientIp(req.headers)`.

El flujo es:

1. Obtener la IP del cliente.
2. Validar el ID de la publicación.
3. Aplicar el rate limit por IP.
4. Obtener la sesión opcional.
5. Obtener el detalle de la publicación.
6. Devolver la respuesta.

Ejemplo:

```ts
export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const clientIp = getClientIp(req.headers)

    if (!clientIp) {
      return NextResponse.json(
        { error: "Unable to identify client" },
        { status: 400 }
      )
    }

    const allowedByIp = rateLimiter(
      `job-details:ip:${clientIp}`,
      rateLimitConfig.getJobDetails.ip.limit,
      rateLimitConfig.getJobDetails.ip.windowMs
    )

    if (!allowedByIp) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    const user = await getOptionalSessionUser()

    let { id } = await params
    let jobId = parseId(id)

    const job = await jobService.getJobDetailsById(
      jobId,
      user?.id
    )

    return NextResponse.json(
      { ok: true, job },
      { status: 200 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}
```

## Configuración de Rate Limit

```ts
getJobDetails: {
  ip: {
    limit: 60,
    windowMs: 60 * 1000
  }
}
```

## Respuesta exitosa (200)

```json
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

Además de la información pública:

- `alreadyApplied`: indica si el usuario autenticado ya se postuló.
- `numberOfApplicants`: se incluye únicamente cuando la publicación tiene un límite de postulaciones configurado.

## Posibles respuestas de error

| Código | Descripción |
|---|---|
| 400 | ID inválido o no se pudo identificar la IP del cliente. |
| 401 | Error de autenticación (si corresponde). |
| 404 | La publicación no existe o no está disponible. |
| 429 | Se superó el límite de solicitudes por IP. |
| 500 | Error interno del servidor. |

## Dependencias relacionadas

- `getClientIp`
- `rateLimiter`
- `rateLimitConfig.getJobDetails`
- `getOptionalSessionUser`
- `parseId`
- `jobService.getJobDetailsById`
- `errorHandler`

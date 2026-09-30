# POST /api/jobs/:id/apply

## Descripción

Permite que un usuario autenticado se postule a una publicación de
empleo.

## Endpoint

```http
POST /api/jobs/:id/apply
```

## Autenticación

Requiere sesión activa.

## Parámetros

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| `id` | `number` | ID de la publicación. |

## Flujo

1. Verifica que el usuario esté autenticado.

2. Valida el ID de la publicación.

3. Aplica el rate limit correspondiente al usuario autenticado.

4. Ejecuta `jobService.applyJob(userId, jobId)`.

5. Si todo es correcto, registra la postulación y devuelve éxito.

## Rate Limit

El endpoint aplica un límite por usuario autenticado utilizando el
`userId` obtenido de la sesión.

La configuración utilizada es:

- **20 solicitudes por usuario cada 1 hora.**
- Clave: `apply-job:user:${userId}`.

El rate limit se aplica después de verificar la sesión y validar el ID
de la publicación.

Si el usuario alcanza el límite:

- Se responde con **HTTP 429 (Too Many Requests)**.
- No se ejecuta la operación de postulación.

Cada usuario mantiene un contador independiente.

## Respuesta exitosa

**201 Created**

```json
{
  "ok": true
}
```

## Posibles errores

| Código | Motivo |
| ------ | ------ |
| 400 | Usuario sin CV o límite de postulaciones alcanzado. |
| 401 | Usuario no autenticado. |
| 403 | Publicación no disponible o intento de postularse a una publicación propia. |
| 404 | Publicación o usuario inexistente/inactivo. |
| 409 | El usuario ya se encuentra postulado a la publicación. |
| 429 | El usuario alcanzó el límite de solicitudes permitido. |

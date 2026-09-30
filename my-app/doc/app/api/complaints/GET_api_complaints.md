# GET /api/complaints — Controller

## Objetivo

El controller de `GET /api/complaints` recibe la petición, obtiene la sesión del usuario, valida el parámetro de paginación `page`, aplica el rate limit correspondiente y delega la obtención de las quejas al service.

## Flujo

1. Obtiene el `userId` mediante `requireSession()`.
2. Obtiene los query parameters mediante `req.nextUrl.searchParams`.
3. Obtiene el parámetro `page`.
4. Valida `page` utilizando `PageSchema`.
5. Si la validación falla, responde con **HTTP 400**.
6. Si la validación es correcta, obtiene el número de página.
7. Aplica el rate limit por `userId`.
8. Si se supera el límite, responde con **HTTP 429**.
9. Envía `userId` y `page` al service.
10. Recibe `complaints` y `hasNextPage`.
11. Devuelve ambos valores junto con `ok: true`.

## Parámetro `page`

El endpoint permite solicitar una página específica mediante un query parameter:

```text
GET /api/complaints?page=2
```

Si `page` no se proporciona, `PageSchema` utiliza `1` como valor predeterminado.

La validación se realiza antes de llamar al service, por lo que este recibe `page` como un número válido.

## Rate Limit

El endpoint es exclusivo para administradores, por lo que el límite se aplica por usuario autenticado y no por IP.

- **Límite:** 30 solicitudes por minuto.
- **Ventana:** 1 minuto.
- **Clave:** `list-complaints:user:${userId}`.
- Si se supera el límite, responde con **HTTP 429**.

La autorización mediante `requireAdmin(user.role)` continúa siendo responsabilidad del service. El rate limit no reemplaza la autorización.

## Respuesta exitosa

La respuesta mantiene una estructura plana:

```json
{
  "ok": true,
  "complaints": [],
  "hasNextPage": true
}
```

El controller no contiene la lógica de paginación. Su responsabilidad es recibir y validar la entrada, aplicar el rate limit y delegar la operación al service.

## Manejo de errores

Los errores producidos durante la ejecución se envían al `errorHandler`, mientras que los errores de validación de `page` generan directamente una respuesta `400`.

Si el usuario supera el límite de solicitudes, el controller responde directamente con `429 Too Many Requests`.

## Dependencias de Rate Limit

El controller utiliza:

- `rateLimiter`
- `rateLimitConfig.listComplaints.user`

Ejemplo de configuración:

```ts
listComplaints: {
  user: {
    limit: 30,
    windowMs: 60 * 1000
  }
}
```

La key utilizada por el rate limiter es:

```ts
`list-complaints:user:${userId}`
```

# GET /api/location

## Descripción

Obtiene todas las locaciones registradas en el sistema, tanto activas como inactivas.

Este endpoint está destinado al panel de administración para permitir la gestión de locaciones (listar, editar, activar o desactivar).

## Autorización

Requiere una sesión válida.

Flujo:

1. Obtiene el ID del usuario autenticado mediante `requireSession()`.

2. Aplica el rate limit correspondiente al usuario autenticado.

3. Llama a `locationService.getAllLocations(userId)`.

4. El servicio verifica:
   - Que el usuario exista.
   - Que el usuario esté activo.
   - Que tenga rol `admin` o `superAdmin`.

5. Devuelve todas las locaciones.

## Rate Limit

El endpoint utiliza un rate limit basado en el usuario autenticado.

### Configuración

- **Límite:** 30 solicitudes
- **Ventana:** 1 minuto
- **Identificador:** `userId`
- **Clave:** `list-locations:user:${userId}`

Configuración centralizada:

```ts
getAllLocations: {
  user: {
    limit: 30,
    windowMs: 60 * 1000
  }
}
```
El rate limit se aplica después de obtener la sesión y antes de ejecutar el service.

Si el usuario supera el límite establecido, el endpoint responde con:
```ts
{
  "error": "Too many requests"
}
```
El rate limit funciona como una capa adicional de protección y no reemplaza las validaciones de autenticación, estado de cuenta o autorización realizadas por el service.

## Endpoint

```http
GET /api/location
```

## Respuesta exitosa

**Status:** `200 OK`

```json
{
  "ok": true,
  "locations": [
    {
      "id": 1,
      "name": "san luis",
      "isActive": true
    }
  ]
}
```

## Posibles errores

| Status | Descripción |
|----------|-------------|
| 401 | No existe una sesión válida |
| 403 | Usuario inactivo o sin permisos de administrador |
| 404 | Usuario autenticado no encontrado en la base de datos |
| 429 | Se superó el límite de solicitudes permitido
| 500 | Error interno del servidor |

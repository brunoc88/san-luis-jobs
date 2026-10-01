# GET /api/location/active

## Descripción

Obtiene el listado de todas las locaciones activas.

Este endpoint puede ser utilizado por cualquier usuario autenticado y devuelve únicamente las locaciones con `isActive = true`.

Este endpoint se utiliza principalmente para cargar las opciones de localidad en los formularios de creación y edición de Jobs.

## Endpoint

```http
GET /api/location/active
```

## Autorización

Requiere una sesión válida. El servicio verifica que el usuario exista y esté activo. No requiere permisos de administrador.

## Flujo

1. Obtiene el usuario autenticado con `requireSession()`.
2. Aplica el rate limit correspondiente al usuario autenticado.
3. Ejecuta `locationService.getAllActiveLocations(userId)`.
4. Retorna las locaciones activas.

## Rate Limit

El endpoint utiliza un rate limit basado en el usuario autenticado.

Configuración
. Límite: 60 solicitudes
. Ventana: 1 minuto
. Identificador: userId
. Clave: list-active-locations:user:${userId}

```ts
getAllActiveLocations: {
  user: {
    limit: 60,
    windowMs: 60 * 1000
  }
}
```
El rate limit se aplica después de obtener la sesión y antes de ejecutar el service.

Si el usuario supera el límite establecido, el endpoint responde con:

429 Too Many Requests

```ts
{
  "error": "Too many requests"
}
```
El rate limit funciona como una capa adicional de protección y no reemplaza las validaciones de autenticación ni de estado de cuenta realizadas por el service.

## Respuesta exitosa

**200 OK**

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
|---|---|
| 401 | No existe una sesión válida |
| 403 | Usuario inactivo |
| 404 | Usuario inexistente |
| 429 | Se superó el límite de solicitudes permitido |
| 500 | Error interno del servidor |

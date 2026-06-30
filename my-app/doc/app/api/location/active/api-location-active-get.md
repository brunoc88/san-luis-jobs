# GET /api/location/active

## Descripción

Obtiene el listado de todas las locaciones activas.

Este endpoint puede ser utilizado por cualquier usuario autenticado y devuelve únicamente las locaciones con `isActive = true`.

## Endpoint

```http
GET /api/location/active
```

## Autorización

Requiere una sesión válida. El servicio verifica que el usuario exista y esté activo. No requiere permisos de administrador.

## Flujo

1. Obtiene el usuario autenticado con `requireSession()`.
2. Ejecuta `locationService.getAllActiveLocations(userId)`.
3. Retorna las locaciones activas.

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
| 500 | Error interno del servidor |

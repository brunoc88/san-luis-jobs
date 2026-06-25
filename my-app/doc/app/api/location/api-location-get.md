# GET /api/location

## Descripción
Obtiene todas las locaciones registradas en el sistema, tanto activas como inactivas.

Este endpoint está destinado al panel de administración para permitir la gestión de locaciones (listar, editar, activar o desactivar).

## Autorización
Requiere una sesión válida.

Flujo:

1. Obtiene el ID del usuario autenticado mediante `requireSession()`.
2. Llama a `locationService.getAllLocations(userId)`.
3. El servicio verifica:
   - Que el usuario exista.
   - Que el usuario esté activo.
   - Que tenga rol `admin` o `superAdmin`.
4. Devuelve todas las locaciones.

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
| 500 | Error interno del servidor |

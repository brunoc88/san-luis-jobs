# PATCH /api/location/[id]/toggle

## Descripción

Activa o desactiva una locación alternando el valor de `isActive`.

## Endpoint

```http
PATCH /api/location/{id}/toggle
```

## Autorización

Requiere una sesión válida. El servicio verifica que el usuario exista, esté activo y tenga rol `admin` o `superAdmin`.

## Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| id | number | Identificador de la locación |

## Flujo

1. Obtiene el usuario autenticado con `requireSession()`.
2. Lee el parámetro `id`.
3. Convierte el id a número.
4. Ejecuta `locationService.toggleLocationStatus(userId, locationId)`.
5. Retorna la locación actualizada.

## Respuesta exitosa

**200 OK**

```json
{
  "ok": true,
  "location": {
    "id": 1,
    "name": "san luis",
    "isActive": false
  }
}
```

## Posibles errores

| Status | Descripción |
|---|---|
| 400 | Identificador inválido |
| 401 | No existe una sesión válida |
| 403 | Usuario inactivo o sin permisos administrativos |
| 404 | Usuario o locación inexistentes |
| 500 | Error interno del servidor |

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

## Rate Limit

El endpoint aplica un límite por usuario autenticado.

- Límite: 10 solicitudes.
- Ventana: 1 hora.
- Identificador: userId.
- Key: toggle-location-status:user:${userId}.
- Configuración: rateLimitConfig.toggleLocationStatus.

Si se supera el límite, retorna:

429 Too Many Requests

```js
{
  "error": "Too many requests"
}
```
El rate limit se aplica después de obtener y convertir el id, y antes de ejecutar la lógica de negocio.

El rate limit es una capa adicional de protección y no reemplaza la autenticación ni la autorización administrativa.

## Flujo

1. Obtiene el usuario autenticado con `requireSession()`.
2. Lee el parámetro `id`.
3. Convierte el id a número.
4. Aplica el rate limit al usuario autenticado.
5. Si se supera el límite, retorna `429 Too Many Requests`.
6. Ejecuta `locationService.toggleLocationStatus(userId, locationId)`.
7. El servicio verifica:
  - Existencia del usuario.
  - Estado activo del usuario.
  - Permisos administrativos.
  - Existencia de la locación.
8. Alterna el estado de la locación.
9. Retorna la locación actualizada.

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
| 429 | Se superó el límite de solicitudes |
| 500 | Error interno del servidor |

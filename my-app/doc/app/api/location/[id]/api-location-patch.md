# PATCH /api/location/[id]

## Descripción

Actualiza el nombre de una locación existente.

## Endpoint

```http
PATCH /api/location/{id}
```

## Autorización

Requiere una sesión válida. El servicio verifica que el usuario exista, esté activo y posea rol `admin` o `superAdmin`.

## Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| id | number | Identificador de la locación |

## Request Body

```json
{
  "name": "villa mercedes"
}
```

Validado mediante `locationInputSchema`.

## Flujo

1. Obtiene el usuario autenticado con `requireSession()`.
2. Obtiene el parámetro `id`.
3. Convierte el identificador a número.
4. Valida el cuerpo de la solicitud.
5. Ejecuta `locationService.renameLocation(userId, locationId, name)`.
6. Retorna la locación actualizada.

## Respuesta exitosa

**200 OK**

```json
{
  "ok": true,
  "location": {
    "id": 1,
    "name": "villa mercedes",
    "isActive": true
  }
}
```

## Posibles errores

| Status | Descripción |
|---|---|
| 400 | Datos inválidos o identificador inválido |
| 401 | No existe una sesión válida |
| 403 | Usuario inactivo o sin permisos administrativos |
| 404 | Usuario o locación inexistentes |
| 409 | Ya existe una locación con ese nombre |
| 500 | Error interno del servidor |

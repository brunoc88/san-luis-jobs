# POST /api/location

## Descripción

Crea una nueva locación en el sistema.

Este endpoint está destinado a usuarios con permisos administrativos y será utilizado posteriormente durante la creación de empleos.

## Autorización

Requiere una sesión válida.

El flujo de autorización y permisos es delegado al servicio de locaciones.

## Endpoint

```http
POST /api/location
```

## Request Body

```json
{
  "name": "san luis"
}
```

## Validaciones

Los datos recibidos son validados mediante `locationInputSchema`.

Reglas actuales:

- Campo obligatorio.
- Conversión a minúsculas.
- Eliminación de espacios al inicio y final.
- Longitud mínima configurada en el esquema.

## Rate Limit

El endpoint aplica un límite por usuario autenticado.

- Límite: 10 solicitudes.
- Ventana: 1 hora.
- Identificador: userId.
- Key: create-location:user:${userId}.
- Configuración: rateLimitConfig.createLocation.

Si se supera el límite, retorna:

Status: 429 Too Many Requests

```js
{
  "error": "Too many requests"
}
```
El rate limit se aplica después de validar el cuerpo de la petición y antes de ejecutar la lógica de negocio.

El rate limit constituye una capa adicional de protección y no reemplaza la autenticación ni la autorización administrativa.

## Flujo

1. Obtiene el identificador del usuario autenticado mediante `requireSession()`.
2. Valida el cuerpo de la petición utilizando `validateRequest()`.
3. Si la validación falla, retorna el error correspondiente.
4. Aplica el rate limit al usuario autenticado.
5. Si se supera el límite, retorna 429 Too Many Requests.
6. Ejecuta `locationService.createLocation(userId, name)`.
7. El servicio verifica:
   - Existencia del usuario.
   - Estado activo del usuario.
   - Permisos administrativos.
8. Crea la locación.
9. Retorna una respuesta exitosa junto a la locacion creada.

## Respuesta exitosa

**Status:** `201 Created`

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
|----------|-------------|
| 400 | Datos inválidos enviados en la solicitud |
| 401 | No existe una sesión válida |
| 403 | Usuario inactivo o sin permisos administrativos |
| 404 | Usuario autenticado no encontrado |
| 409 | La locación ya existe |
| 429 | Se superó el límite de solicitudes |
| 500 | Error interno del servidor |

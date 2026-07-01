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

## Flujo

1. Obtiene el identificador del usuario autenticado mediante `requireSession()`.
2. Valida el cuerpo de la petición utilizando `validateRequest()`.
3. Si la validación falla, retorna el error correspondiente.
4. Ejecuta `locationService.createLocation(userId, name)`.
5. El servicio verifica:
   - Existencia del usuario.
   - Estado activo del usuario.
   - Permisos administrativos.
6. Crea la locación.
7. Retorna una respuesta exitosa junto a la locacion creada.

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
| 500 | Error interno del servidor |

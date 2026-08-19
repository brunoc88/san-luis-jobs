# POST /api/feedback

## Descripción

Registra una nueva opinión o feedback de un usuario sobre la plataforma.

El endpoint requiere que el usuario tenga una sesión válida. El `userId` se obtiene desde la sesión autenticada y no se recibe desde el cliente.

Un mismo usuario puede registrar múltiples opiniones.

## Método y ruta

```http
POST /api/feedback
```

## Autenticación

**Requerida.**

El usuario debe tener una sesión válida. El `userId` se obtiene mediante `requireSession()`.

No se recomienda recibir `userId` desde el body de la petición, ya que permitiría que un cliente intente crear feedback asociado a otro usuario.

## Request Body

El body debe contener la opinión:

```json
{
  "opinion": "La plataforma es muy fácil de usar."
}
```

### Validaciones

La validación del body se realiza mediante `FeedBackRegisterSchema`.

Actualmente se recomienda establecer:

- `opinion`: string obligatorio.
- Mínimo: **10 caracteres**.
- Máximo: **500 caracteres**.

> El límite máximo evita que el endpoint sea utilizado para enviar contenido excesivamente grande y mantiene el feedback enfocado.

## Flujo

1. Se obtiene el usuario autenticado mediante `requireSession()`.
2. Se valida el body mediante `validateRequest()`.
3. Si la validación falla, se devuelve el error correspondiente.
4. Se delega la creación del feedback a `feedbackService.create()`.
5. El service verifica que el usuario exista y esté activo.
6. El repository crea el registro asociado al `userId`.
7. Si todo es correcto, se devuelve `201 Created`.

## Respuestas

### 201 — Feedback creado correctamente

```json
{
  "ok": true
}
```

### Error de validación

El formato exacto depende de `FeedBackRegisterSchema` y de `validateRequest()`.

Por ejemplo, una opinión vacía o con menos de 10 caracteres debe ser rechazada antes de llegar al service.

### 401 — Usuario no autenticado

Si `requireSession()` determina que no existe una sesión válida, el error es procesado por `errorHandler()`.

### Otros errores

Los errores inesperados y los errores de dominio son procesados mediante:

```ts
errorHandler(error)
```

## Arquitectura

El endpoint mantiene la separación de responsabilidades:

```text
Route
  ↓
requireSession()
  ↓
validateRequest()
  ↓
feedbackService.create()
  ↓
requireActiveUserById()
  ↓
feedbackRepo.create()
  ↓
Database
```

La route se encarga principalmente de HTTP, autenticación inicial y validación.

La lógica de negocio queda en el service y el acceso a Prisma queda en el repository.

## Seguridad

### No aceptar `userId` desde el cliente

El usuario no debe enviar algo como:

```json
{
  "opinion": "Excelente sitio",
  "userId": 123
}
```

El `userId` debe determinarse a partir de la sesión:

```ts
const userId = await requireSession()
```

Esto evita que un usuario pueda intentar registrar una opinión utilizando el ID de otra cuenta.

### Verificación de usuario activo

Aunque la sesión sea válida, el service debe verificar que el usuario siga activo mediante `requireActiveUserById()`.

Esto mantiene consistente la regla utilizada en otras operaciones del backend.

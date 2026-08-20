# Feedback Service — deleteById

## Descripción

`deleteById` contiene la lógica de negocio para eliminar físicamente un feedback.

La operación está restringida a usuarios administrativos y aplica reglas específicas según el rol del usuario que intenta eliminar y el rol del autor del feedback.

## Implementación

```ts
deleteById: async (id: number, userId: number) => {
    const user = await requireActiveUserById(userId)
    requireAdmin(user.role)

    const feedbackData = await feedbackRepo.findById(id)
    if (!feedbackData) throw new NotFoundError()

    if (feedbackData.userId === user.id) {
        throw new ForbiddenError('No puedes eliminar tu propia publicacion')
    }

    const author = await userRepo.findById(feedbackData.userId)

    if (author?.role === 'superAdmin' && user.role === 'admin') {
        throw new ForbiddenError()
    }

    await feedbackRepo.deleteById(feedbackData.id)
}
```

## Parámetros

### `id`

Identificador numérico del feedback que se desea eliminar.

```ts
id: number
```

### `userId`

Identificador del usuario autenticado que solicita la eliminación.

```ts
userId: number
```

Este ID proviene de la sesión autenticada y no del body de la petición.

## Flujo

```text
deleteById(feedbackId, userId)
        ↓
requireActiveUserById(userId)
        ↓
requireAdmin(user.role)
        ↓
feedbackRepo.findById(feedbackId)
        ↓
¿Existe?
   ↓          ↓
  NO          SÍ
  ↓           ↓
404       ¿Es propio?
             ↓       ↓
            SÍ       NO
            ↓         ↓
           403     buscar autor
                       ↓
              ¿autor superAdmin
               y usuario admin?
                    ↓       ↓
                   SÍ       NO
                   ↓         ↓
                  403     eliminar
```

## 1. Verificación del usuario

```ts
const user = await requireActiveUserById(userId)
```

Se comprueba que el usuario obtenido de la sesión:

- Exista en la base de datos.
- Se encuentre activo.

Un usuario que no cumpla estas condiciones no puede continuar con la operación.

## 2. Autorización administrativa

```ts
requireAdmin(user.role)
```

Solo los usuarios con permisos administrativos pueden acceder a la operación.

Los roles permitidos son:

- `admin`
- `superAdmin`

Un usuario común no puede eliminar feedbacks.

## 3. Búsqueda del feedback

```ts
const feedbackData = await feedbackRepo.findById(id)

if (!feedbackData) throw new NotFoundError()
```

Primero se verifica que el feedback exista.

El repository devuelve `null` cuando no encuentra el registro y el service transforma ese resultado en `NotFoundError`.

## 4. Impedir el borrado del propio feedback

```ts
if (feedbackData.userId === user.id) {
    throw new ForbiddenError('No puedes eliminar tu propia publicacion')
}
```

Ningún usuario administrativo puede utilizar sus permisos para eliminar su propia opinión.

Esta regla se aplica tanto a:

- `admin`
- `superAdmin`

La comparación se realiza utilizando el `userId` asociado al feedback y el ID del usuario autenticado.

## 5. Obtener el autor del feedback

```ts
const author = await userRepo.findById(feedbackData.userId)
```

Se obtiene el usuario que creó el feedback para poder aplicar la jerarquía administrativa.

La existencia del autor está respaldada por la relación entre `Feedback` y `User`.

El autor puede encontrarse actualmente inactivo o suspendido. Esto no impide consultar su rol para aplicar las reglas de autorización.

## 6. Jerarquía entre `admin` y `superAdmin`

```ts
if (author?.role === 'superAdmin' && user.role === 'admin') {
    throw new ForbiddenError()
}
```

Un `admin` no puede eliminar un feedback creado por un `superAdmin`.

Esto establece una jerarquía administrativa:

```text
superAdmin
    ↓
admin
    ↓
user
```

Por lo tanto:

- `admin` → puede eliminar feedback de usuarios comunes.
- `admin` → puede eliminar feedback de otros `admin`, siempre que no sea el suyo.
- `admin` → no puede eliminar feedback de `superAdmin`.
- `superAdmin` → puede eliminar feedback de usuarios comunes.
- `superAdmin` → puede eliminar feedback de `admin`.
- `superAdmin` → puede eliminar feedback de otro `superAdmin`, siempre que no sea el suyo.
- Ningún usuario → puede eliminar su propio feedback.

## 7. Borrado físico

Si todas las validaciones anteriores son superadas:

```ts
await feedbackRepo.deleteById(feedbackData.id)
```

El repository elimina físicamente el registro de la base de datos.

No se utiliza soft delete para `Feedback`.

Una vez completada la operación, el registro deja de existir en la tabla correspondiente.

## Estados del autor

El autor del feedback puede encontrarse actualmente:

```text
isActive = false
```

o:

```text
isActive = false
isSuspended = true
```

Esto no modifica la regla de jerarquía.

El rol del autor continúa siendo relevante para determinar si un `admin` puede eliminar su feedback.

Por ejemplo:

```text
Autor:
role = superAdmin
isActive = false
isSuspended = true

Solicitante:
role = admin
isActive = true

Resultado:
403 Forbidden
```

## Errores

### Usuario no activo

Generado por:

```ts
requireActiveUserById(userId)
```

### Usuario sin permisos administrativos

Generado por:

```ts
requireAdmin(user.role)
```

### Feedback inexistente

Generado mediante:

```ts
throw new NotFoundError()
```

### Intento de eliminar el propio feedback

Generado mediante:

```ts
throw new ForbiddenError('No puedes eliminar tu propia publicacion')
```

### `admin` intentando eliminar feedback de `superAdmin`

Generado mediante:

```ts
throw new ForbiddenError()
```

## Separación de responsabilidades

El service se encarga de las reglas de negocio y autorización.

No se encarga de:

- Obtener la sesión HTTP.
- Procesar parámetros de la URL.
- Construir respuestas HTTP.
- Ejecutar directamente consultas de Prisma.

El flujo arquitectónico es:

```text
Controller
    ↓
Service
    ↓
Repositories
    ↓
Database
```

## Estado actual

- [x] Verificación de usuario activo.
- [x] Autorización administrativa.
- [x] Verificación de existencia del feedback.
- [x] Prohibición de eliminar el propio feedback.
- [x] Jerarquía `admin` / `superAdmin`.
- [x] Borrado físico.
- [x] Manejo de feedback inexistente.
- [x] Separación entre lógica de negocio y persistencia.

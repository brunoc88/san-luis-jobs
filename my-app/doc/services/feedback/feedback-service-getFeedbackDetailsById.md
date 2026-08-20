# Feedback Service — getFeedbackDetailsById

## Descripción

`getFeedbackDetailsById` contiene la lógica de negocio para obtener los detalles de un feedback.

La operación está restringida a usuarios administrativos y requiere que el usuario de la sesión siga existiendo y esté activo.

## Implementación

```ts
getFeedbackDetailsById: async (feedbackId: number, userId: number) => {
    const user = await requireActiveUserById(userId)

    requireAdmin(user.role)

    const feedbackData = await feedbackRepo.findById(feedbackId)

    if (!feedbackData) throw new NotFoundError()

    return feedbackData
}
```

## Parámetros

### `feedbackId`

Identificador numérico del feedback que se desea consultar.

```ts
feedbackId: number
```

El ID ya llega validado desde el controller mediante `parseId()`.

### `userId`

Identificador del usuario obtenido de la sesión autenticada.

```ts
userId: number
```

No proviene del body ni de un parámetro enviado por el cliente.

## Flujo

```text
getFeedbackDetailsById(feedbackId, userId)
        ↓
requireActiveUserById(userId)
        ↓
requireAdmin(user.role)
        ↓
feedbackRepo.findById(feedbackId)
        ↓
¿feedbackData?
     ↓          ↓
    null       datos
     ↓          ↓
NotFoundError  return
```

## 1. Verificación del usuario

```ts
const user = await requireActiveUserById(userId)
```

Comprueba que el usuario de la sesión:

- Exista en la base de datos.
- Se encuentre activo.

La existencia de una sesión válida por sí sola no es suficiente para autorizar la operación.

## 2. Autorización administrativa

```ts
requireAdmin(user.role)
```

Solo pueden continuar los usuarios con los roles administrativos permitidos:

- `admin`
- `superAdmin`

Un usuario común recibe el error de autorización correspondiente.

La autorización se realiza antes de consultar el feedback.

## 3. Consulta del feedback

```ts
const feedbackData = await feedbackRepo.findById(feedbackId)
```

El service delega la consulta al repository.

El repository debe devolver los datos necesarios para la vista administrativa, incluyendo el `username` del usuario que realizó el feedback.

## 4. Feedback inexistente

Si el repository no encuentra el registro, devuelve `null`.

El service transforma ese resultado en un error de dominio:

```ts
if (!feedbackData) throw new NotFoundError()
```

De esta forma, el repository solamente informa que el recurso no existe, mientras que el service decide cómo debe interpretarse esa situación dentro de la lógica de negocio.

## Retorno

Si el feedback existe y el usuario está autorizado:

```ts
return {
            id: feedbackData.id,
            createdAt: feedbackData.createdAt,
            from: feedbackData?.user.username,
            opinion: feedbackData.opinion
        }
```

El controller recibe estos datos y construye la respuesta HTTP `200`.

## Seguridad

El `userId` utilizado para determinar los permisos procede de la sesión:

```text
Session
   ↓
userId
   ↓
requireActiveUserById()
   ↓
user.role
   ↓
requireAdmin()
```

El cliente no puede proporcionar un `userId` arbitrario para intentar acceder a información administrativa.

## Separación de responsabilidades

El service no se ocupa de:

- Obtener la sesión.
- Procesar parámetros HTTP.
- Construir respuestas HTTP.
- Ejecutar directamente consultas de Prisma.

Sus responsabilidades son:

- Validar que el usuario esté activo.
- Autorizar el acceso administrativo.
- Solicitar el feedback al repository.
- Convertir un resultado inexistente en `NotFoundError`.
- Devolver los datos obtenidos.

## Estado actual

- [x] Verificación de usuario activo.
- [x] Autorización de `admin` y `superAdmin`.
- [x] Consulta mediante repository.
- [x] Manejo de feedback inexistente.
- [x] Inclusión de la lógica de negocio fuera del controller.
- [x] Separación entre service y repository.

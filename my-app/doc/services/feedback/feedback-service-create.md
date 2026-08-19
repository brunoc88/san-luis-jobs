# Documentación - feedBackeService.create()

## Método `create`

### Parámetros

#### `opinion`

Contenido de la opinión que será registrada.

```ts
{ opinion: string }
```

La validación de longitud y contenido se realiza previamente mediante `FeedBackRegisterSchema`, por lo que el service recibe datos que ya fueron validados.

#### `userId`

ID del usuario obtenido a partir de la sesión autenticada.

```ts
userId: number
```

El `userId` no proviene directamente del body enviado por el cliente.

### Retorno

```ts
Promise<void>
```

El service no devuelve información del feedback creado. Si la operación finaliza correctamente, simplemente resuelve la Promise.

## Flujo

El método sigue el siguiente flujo:

```text
Route
  ↓
feedbackService.create()
  ↓
requireActiveUserById(userId)
  ↓
feedbackRepo.create()
  ↓
Database
```

### 1. Verificación del usuario

```ts
const user = await requireActiveUserById(userId)
```

Se verifica que el usuario exista y se encuentre activo.

Si el usuario no existe o no está habilitado para utilizar la plataforma, `requireActiveUserById()` lanza el error correspondiente y la creación del feedback no continúa.

### 2. Creación del feedback

```ts
await feedbackRepo.create({
    opinion,
    userId: user.id
})
```

Una vez validado el usuario, el service delega la persistencia al repository.

Se utiliza `user.id` obtenido desde la base de datos en lugar de confiar en un identificador enviado por el cliente.

## Responsabilidades

El service se encarga de:

- Verificar que el usuario esté activo.
- Coordinar la creación del feedback.
- Pasar al repository los datos necesarios.

El service **no se encarga de**:

- Validar el formato de `opinion`.
- Gestionar HTTP.
- Obtener la sesión.
- Ejecutar directamente operaciones de Prisma.
- Determinar el `userId` desde el request.

Estas responsabilidades pertenecen respectivamente al schema, route, sistema de autenticación y repository.

## Seguridad

El flujo evita asociar una opinión con un usuario arbitrario enviado desde el cliente.

El identificador utilizado por el service proviene de:

```text
Sesión autenticada
      ↓
userId
      ↓
requireActiveUserById()
      ↓
user.id
      ↓
feedbackRepo.create()
```

Esto mantiene la asociación entre feedback y usuario bajo control del backend.

## Múltiples opiniones

El service no impone ninguna restricción de cantidad de opiniones por usuario.

Por lo tanto, un mismo usuario puede ejecutar:

```text
create()
create()
create()
```

y generar múltiples registros de feedback, siempre que las demás reglas de la aplicación lo permitan.

## Estado actual

- [x] Verificación de usuario activo.
- [x] Asociación segura entre feedback y usuario.
- [x] Delegación de persistencia al repository.
- [x] Soporte para múltiples opiniones por usuario.
- [x] Separación de responsabilidades entre route, service y repository.

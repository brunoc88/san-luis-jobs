# PATCH /api/users/:id/activate — Controller

## Descripción

Este controller se encarga de procesar la solicitud para **activar una cuenta de usuario previamente desactivada voluntariamente como tambien de una cuenta creada pero que nunca fue activada**.

El controller no contiene reglas de negocio. Su responsabilidad es:

1. Obtener el usuario autenticado mediante la sesión.
2. Obtener y validar el `id` recibido como parámetro de ruta.
3. Delegar la activación al `adminService`.
4. Enviar un email de notificación al usuario cuya cuenta fue activada.
5. Retornar una respuesta HTTP exitosa.
6. Delegar el manejo de errores al `errorHandler`.

---

## Endpoint

**PATCH** `/api/users/:id/activate`

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID del usuario cuya cuenta se desea activar. |

El parámetro recibido desde la URL es convertido a `number` mediante `parseId`.

---

## Flujo

```text
Request
   │
   ▼
requireSession()
   │
   ▼
Obtener params.id
   │
   ▼
parseId(id)
   │
   ▼
adminService.activateUserAccount()
   │
   ├── Error → errorHandler()
   │
   ▼
Obtiene email del usuario activado
   │
   ▼
mailService.sendAccountActivatedEmail()
   │
   ├── Error → errorHandler()
   │
   ▼
HTTP 200 { ok: true }
```

---

## Implementación

```ts
export const PATCH = async ({ params }: { params: Promise<{ id: string }> }) => {

    try {

        const userId = await requireSession()

        const { id } = await params

        const inactiveUserId = parseId(id)

        const { email } = await adminService.activateUserAccount(
            userId,
            inactiveUserId
        )

        await mailService.sendAccountActivatedEmail(email)

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )

    } catch (error) {

        return errorHandler(error)

    }

}
```

---

## Responsabilidades

### `requireSession()`

Obtiene el ID del usuario autenticado.

El controller no determina si el usuario tiene permisos para activar cuentas. Esa validación pertenece al service.

---

### `parseId(id)`

Convierte y valida el parámetro `id` recibido desde la URL.

El resultado corresponde al usuario cuya cuenta se desea activar.

---

### `adminService.activateUserAccount()`

Delega toda la lógica de negocio relacionada con la activación.

El service se encarga de validar:

- Que el usuario solicitante esté activo.
- Que tenga permisos administrativos.
- Que el usuario objetivo exista.
- Que la cuenta no esté suspendida.
- Que la cuenta realmente esté inactiva.
- Que el rol del usuario objetivo sea compatible con el rol del administrador que realiza la acción.
- Si existe token viculado a al usuario que se desea activar.

Después de realizar la activación, el service devuelve el email del usuario afectado.

```ts
const { email } = await adminService.activateUserAccount(
    userId,
    inactiveUserId
)
```

El controller utiliza ese email únicamente para realizar la notificación.

---

### `mailService.sendAccountActivatedEmail()`

Envía un correo electrónico notificando al usuario que su cuenta fue activada.

El envío se realiza **después de que el service haya completado correctamente la activación**.

```ts
await mailService.sendAccountActivatedEmail(email)
```

El controller no construye el contenido del email; esa responsabilidad pertenece exclusivamente al `mailService`.

---

## Respuesta exitosa

Si la activación y el envío del email se completan correctamente:

**HTTP 200**

```json
{
    "ok": true
}
```

---

## Manejo de errores

Todos los errores producidos durante el flujo son capturados por el `try/catch` y enviados al `errorHandler`.

```ts
catch (error) {
    return errorHandler(error)
}
```

Esto mantiene centralizado el formato y tratamiento de las respuestas de error.

---

## Separación de responsabilidades

| Capa | Responsabilidad |
|---|---|
| Controller | Orquestar la petición HTTP |
| Service | Validar reglas de negocio y activar la cuenta |
| Repository | Modificar los datos en la base de datos |
| Mail Service | Enviar la notificación por email |
| Error Handler | Transformar errores en respuestas HTTP |

El controller funciona como **orquestador**, sin incorporar reglas de negocio ni acceso directo a Prisma.
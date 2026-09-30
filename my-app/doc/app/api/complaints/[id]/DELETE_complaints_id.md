# DELETE /api/complaints/:id

## Descripción

Elimina una denuncia mediante borrado lógico.

El endpoint obtiene la sesión del usuario, valida el parámetro `id` y delega la operación al service correspondiente.

## Endpoint

**DELETE** `/api/complaints/:id`

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID de la denuncia que se desea eliminar. Se valida y convierte a número mediante `parseId`. |

## Rate Limit

El endpoint utiliza un rate limit basado en el usuario autenticado.

### Configuración

- **Límite:** 10 solicitudes
- **Ventana:** 1 hora
- **Identificador:** `userId`
- **Clave:** `delete-complaint:user:${userId}`

Este límite es más restrictivo que el utilizado para las consultas de denuncias debido a que se trata de una operación destructiva y exclusiva de administradores.

El rate limit controla la cantidad de intentos de eliminación realizados por cada usuario durante la ventana establecida.

## Implementación

```ts
export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const userId = await requireSession()

    const { id } = await params
    const complaintId = parseId(id)

    const allowedByUserId = rateLimiter(
      `delete-complaint:user:${userId}`,
      rateLimitConfig.deleteComplaint.user.limit,
      rateLimitConfig.deleteComplaint.user.windowMs
    )

    if (!allowedByUserId) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    await complaintService.deleteComplaintById(complaintId, userId)

    return NextResponse.json(
      { ok: true },
      { status: 200 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}
```

## Flujo

1. Se obtiene el `userId` mediante `requireSession()`.
2. Se obtiene el parámetro `id` de la URL.
3. `parseId(id)` valida y convierte el ID a número.
4. Se aplica el rate limit por `userId`.
5. Si se supera el límite, se devuelve HTTP `429`.
6. Si el límite permite la solicitud, se llama a `complaintService.deleteComplaintById(complaintId, userId)`.
7. Si la operación es exitosa, se devuelve `{ ok: true }` con HTTP `200`.
8. Cualquier error es delegado a `errorHandler(error)`.

## Respuesta exitosa

```json
{
  "ok": true
}
```

## Respuesta por Rate Limit

Si el usuario supera el límite establecido:

```json
{
  "error": "Too many requests"
}
```

HTTP `429`.

## Manejo de errores

El endpoint centraliza el manejo de errores mediante:

```ts
errorHandler(error)
```

Esto permite que los errores producidos durante la autenticación, validación, autorización o eliminación sean transformados en la respuesta HTTP correspondiente.

## Reglas de negocio

La autorización y las reglas de negocio permanecen en el service.

El usuario debe:

- estar activo;
- tener rol de administrador;
- no intentar eliminar una denuncia propia;
- no intentar eliminar una denuncia realizada por un usuario con el mismo rol;
- un `admin` no puede eliminar una denuncia realizada por un `superAdmin`.

El rate limit no reemplaza estas validaciones, sino que funciona como una capa adicional de protección contra un volumen excesivo de operaciones destructivas.

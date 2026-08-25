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

## Implementación

```ts
export const DELETE = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const complaintId = parseId(id)

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
4. Se llama a `complaintService.deleteComplaintById(complaintId, userId)`.
5. Si la operación es exitosa, se devuelve `{ ok: true }` con HTTP `200`.
6. Cualquier error es delegado a `errorHandler(error)`.

## Respuesta exitosa

```json
{
    "ok": true
}
```

## Manejo de errores

El endpoint centraliza el manejo de errores mediante:

```ts
errorHandler(error)
```

Esto permite que los errores producidos durante la autenticación, validación, autorización o eliminación sean transformados en la respuesta HTTP correspondiente.

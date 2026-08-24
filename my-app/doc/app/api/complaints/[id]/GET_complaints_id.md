# GET /api/complaints/:id

## Descripción

Obtiene el detalle de una denuncia específica.

El endpoint requiere una sesión activa y delega en el service la validación de permisos y la obtención de los datos de la denuncia.

## Endpoint

**GET** `/api/complaints/:id`

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID de la denuncia. Se convierte a número mediante `parseId`. |

## Implementación

```ts
export const GET = async ({ params }: { params: Promise<{ id: string }> }) => {
    try {
        const userId = await requireSession()

        const { id } = await params
        const complaintId = parseId(id)

        const complaint = await complaintService.getComplaintById(
            complaintId,
            userId
        )

        return NextResponse.json(
            { ok: true, complaint },
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
4. Se llama a `complaintService.getComplaintById(complaintId, userId)`.
5. Si la operación es exitosa, se devuelve la denuncia con HTTP `200`.
6. Cualquier error es delegado a `errorHandler(error)`.

## Respuesta exitosa

```json
{
    "ok": true, 
    "complaint": {
    id: 42,
    date: '2026-08-24T16:37:34.613Z',
    reportedBy: 'admin2',
    jobReported: 'Backend Node.js Junior',
    jobAuthor: 'admin1',
    reason: 'FALSE_INFORMATION',
    explanation: 'all is fake'
  }
}
```

El objeto `complaint` contiene el detalle de la denuncia preparado por el service.

## Manejo de errores

El endpoint no maneja los errores individualmente. Todos los errores son enviados a:

```ts
errorHandler(error)
```

Esto permite centralizar la respuesta HTTP correspondiente según el tipo de error.

## Autenticación y autorización

- El endpoint requiere una sesión válida mediante `requireSession()`.
- La autorización específica para consultar denuncias es responsabilidad de `complaintService.getComplaintById()`.

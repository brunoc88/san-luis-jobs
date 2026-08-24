# Complaint Service - getComplaintById


El service se encarga de aplicar las reglas de negocio antes de obtener y devolver el detalle de la denuncia.

```ts
getComplaintById: async (id: number, userId: number) => {
    const user = await requireActiveUserById(userId)

    requireAdmin(user.role)

    const complaintData = await complaintRepo.findComplaintById(id)

    if (!complaintData) throw new NotFoundError()

    const complaintDetails = {
        id: complaintData.id,
        date: complaintData.createdAt,
        reportedBy: complaintData.user.username,
        jobReported: complaintData.job.title,
        jobAuthor: complaintData.job.user.username,
        reason: complaintData.reason,
        explanation: complaintData.explanation
    }

    return complaintDetails
}
```

### Flujo del service

1. `requireActiveUserById(userId)` verifica que el usuario exista y se encuentre activo.
2. `requireAdmin(user.role)` verifica que el usuario tenga permisos de administrador.
3. `complaintRepo.findComplaintById(id)` obtiene la denuncia junto con la información necesaria.
4. Si la denuncia no existe o no cumple las condiciones del repository, se lanza `NotFoundError`.
5. Se construye `complaintDetails` con únicamente los datos necesarios para la respuesta.
6. Se devuelve el objeto al controller.

### Reglas de autorización

La consulta está restringida a usuarios que:

- Tengan una sesión válida.
- Existan y estén activos.
- Tengan rol de administrador.

La autorización se mantiene en el service, separada de la lógica de acceso a datos del repository.

### DTO de respuesta

El service transforma los datos obtenidos del repository en un objeto específico para el detalle de la denuncia:

| Campo | Origen | Descripción |
|---|---|---|
| `id` | `complaintData.id` | ID de la denuncia. |
| `date` | `complaintData.createdAt` | Fecha de creación de la denuncia. |
| `reportedBy` | `complaintData.user.username` | Usuario que realizó la denuncia. |
| `jobReported` | `complaintData.job.title` | Título del empleo denunciado. |
| `jobAuthor` | `complaintData.job.user.username` | Usuario autor del empleo denunciado. |
| `reason` | `complaintData.reason` | Motivo de la denuncia. |
| `explanation` | `complaintData.explanation` | Explicación proporcionada por quien realizó la denuncia. |

La transformación evita exponer directamente toda la estructura obtenida desde Prisma y permite definir explícitamente qué información recibe el controller y, posteriormente, el cliente.

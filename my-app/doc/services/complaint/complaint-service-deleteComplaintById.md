# Complaint Service - deleteComplaintById

El service concentra las reglas de negocio y autorización necesarias para eliminar una denuncia.

```ts
deleteComplaintById: async (id: number, userId: number) => {
    const user = await requireActiveUserById(userId)

    requireAdmin(user.role)

    const complaintData = await complaintRepo.findComplaintById(id)

    if (!complaintData) throw new NotFoundError()

    if (complaintData.userId === user.id) {
        throw new ForbiddenError('No puedes eliminar tu propia denuncia')
    }

    const complaintAuthorData = await userRepo.findById(complaintData.userId)

    const sameRole = complaintAuthorData?.role === user.role

    const adminDeletingSuperAdmin =
        complaintAuthorData?.role === 'superAdmin' &&
        user.role === 'admin'

    if (sameRole || adminDeletingSuperAdmin) {
        throw new ForbiddenError()
    }

    await complaintRepo.deleteById(complaintData.id)
}
```

### Flujo y reglas de negocio

1. `requireActiveUserById(userId)` verifica que el usuario que realiza la operación exista y esté activo.
2. `requireAdmin(user.role)` verifica que tenga permisos de administrador.
3. `complaintRepo.findComplaintById(id)` obtiene la denuncia.
4. Si la denuncia no existe, se lanza `NotFoundError`.
5. Se verifica que el administrador no sea el autor de la propia denuncia.
6. Se obtiene el usuario que realizó la denuncia mediante `userRepo.findById()`.
7. Se comprueba si ambos usuarios tienen el mismo rol.
8. Se comprueba específicamente que un `admin` no intente eliminar una denuncia realizada por un `superAdmin`.
9. Si alguna regla de protección se incumple, se lanza `ForbiddenError`.
10. Si todas las validaciones son correctas, se delega el borrado lógico al repository mediante `complaintRepo.deleteById()`.

### Restricciones entre roles

La eliminación respeta una jerarquía de permisos:

- Un administrador no puede eliminar su propia denuncia.
- Un usuario no puede eliminar una denuncia realizada por otro usuario con el mismo rol.
- Un `admin` no puede eliminar una denuncia realizada por un `superAdmin`.
- Un `superAdmin` tampoco puede eliminar su propia denuncia.
- Una denuncia realizada por un `superAdmin` puede permanecer activa si no existe otro usuario con permisos suficientes para eliminarla.

### Borrado lógico

La eliminación no elimina físicamente el registro de la base de datos. El repository se encarga de realizar el borrado lógico, manteniendo la denuncia almacenada para conservar su historial.

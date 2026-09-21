# Service — changePassword

## Propósito
Permite cambiar la contraseña de un usuario autenticado y activo.

El service verifica la contraseña actual antes de generar y guardar el hash de la nueva contraseña.

## Firma
```ts
changePassword: async (
    id: number,
    currentPassword: string,
    newPassword: string
)
```

## Flujo
1. Ejecuta `requireActiveUserById(id)`.
2. Obtiene los datos mediante `userRepo.findById(user.id)`.
3. Si no se encuentran, lanza `NotFoundError`.
4. Compara `currentPassword` con el hash almacenado mediante `bcrypt.compare()`.
5. Si es incorrecta, lanza `ForbiddenError`.
6. Genera un nuevo hash para `newPassword` mediante `bcrypt.hash()`.
7. Llama a `userRepo.changePasswordById()` para persistirlo.

## Seguridad
La contraseña actual se verifica mediante `bcrypt.compare()`.

La nueva contraseña no se almacena en texto plano; se genera un hash mediante `bcrypt.hash()` antes de persistirla.

## Validación
El formato, longitud y coincidencia entre la nueva contraseña y su confirmación pertenecen a `changePasswordSchema`.

## Responsabilidad
El service contiene la lógica de negocio: comprobar usuario activo, verificar contraseña actual, generar el nuevo hash y solicitar la actualización al repository.

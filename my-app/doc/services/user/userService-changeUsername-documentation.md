# Service — changeUsername

## Propósito
Cambia el username de un usuario autenticado y activo.

## Firma
```ts
changeUsername: async (id: number, username: string)
```

## Flujo
1. Ejecuta `requireActiveUserById(id)` para comprobar que el usuario existe y está activo.
2. Llama a `userRepo.changeUsernameById(user.id, username)`.
3. El repository intenta actualizar el username.

## Unicidad
El service no realiza una consulta previa para comprobar disponibilidad.

La unicidad está garantizada mediante la constraint `@unique` del modelo `User`.

Si dos requests intentan utilizar simultáneamente el mismo username:
- una actualización puede completarse;
- la otra será rechazada con `P2002`;
- `errorHandler()` transforma `P2002` en **409 Conflict**.

La constraint evita depender únicamente de una consulta previa, que podría quedar expuesta a una condición de carrera.

## Responsabilidad
Comprobar que el usuario pueda realizar la operación y delegar la persistencia al repository.

La validación de formato pertenece al schema y la unicidad a la base de datos.

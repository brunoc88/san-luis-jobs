# Service — activateSuspendedAccount

## Descripción

El método `activateSuspendedAccount` gestiona la reactivación de una cuenta suspendida por parte de un `superAdmin`.

## Flujo

1. Verifica que el usuario que ejecuta la acción exista y esté activo mediante `requireActiveUserById`.
2. Comprueba que el usuario autenticado tenga el rol `superAdmin`.
3. Busca la cuenta objetivo mediante `userRepo.findById`.
4. Si la cuenta no existe, lanza `NotFoundError`.
5. Impide que un `superAdmin` intente levantar su propia suspensión.
6. Comprueba que la suspensión no haya sido levantada previamente.
7. Impide levantar la suspensión de otro usuario con rol `superAdmin`.
8. Solicita al repositorio la reactivación de la cuenta.
9. Solicita al repositorio la desactivación de los warnings asociados al usuario, conservándolos para mantener el historial y la auditoría.
10. Devuelve el email de la cuenta reactivada para que el controller pueda utilizarlo para enviar la notificación correspondiente.

## Reglas de autorización

- Solo un usuario activo con rol `superAdmin` puede ejecutar la operación.
- Un `superAdmin` no puede levantar su propia suspensión.
- Un `superAdmin` no puede levantar la suspensión de otro `superAdmin`.

## Errores

- `NotFoundError`: cuando la cuenta objetivo no existe.
- `ForbiddenError`: cuando el usuario que ejecuta la acción no tiene permisos, intenta operar sobre sí mismo, la suspensión ya fue levantada o la cuenta objetivo pertenece a otro `superAdmin`.

## Retorno

En caso de éxito, devuelve:

```ts
{
  email: suspendedUserData.email
}
```

El email se utiliza posteriormente para enviar al usuario una notificación informándole que su cuenta fue reactivada y que las suspensiones asociadas fueron levantadas.

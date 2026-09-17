# Repository — changeUsernameById

## Propósito
Actualiza el username de un usuario específico.

## Firma
```ts
changeUsernameById: async (id: number, username: string)
```

## Implementación
```ts
return await prisma.user.update({
  data: { username },
  where: { id }
})
```

## Comportamiento
Realiza directamente la actualización del usuario indicado.

La base de datos mantiene la unicidad mediante la constraint `@unique`.

Si el username ya pertenece a otro usuario, Prisma genera `P2002`; `errorHandler()` lo convierte en **409 Conflict**.

## Responsabilidad
El repository se limita a persistir el cambio.

No contiene reglas de validación de formato, autenticación ni lógica de negocio sobre el cambio de username.

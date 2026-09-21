# Repository — changePasswordById

## Propósito
Actualiza el hash de contraseña de un usuario específico.

## Firma
```ts
changePasswordById: async (id: number, password: string)
```

## Implementación
```ts
await prisma.user.update({
    data: { password },
    where: { id }
})
```

## Comportamiento
Recibe el hash ya generado por el service y lo guarda en `password`.

El repository no genera el hash y no recibe la contraseña en texto plano.

## Responsabilidad
Persistir el nuevo hash de contraseña del usuario indicado. La validación, comparación y generación del hash pertenecen al service.

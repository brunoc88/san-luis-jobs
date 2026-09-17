# Repository — changePrivacyById

## Propósito
Actualiza el campo `visibility` de un usuario específico.

## Firma
```ts
changePrivacyById: async (id: number, visibility: boolean)
```

## Implementación
```ts
await prisma.user.update({
  data: { visibility },
  where: { id }
})
```

## Comportamiento
El repository recibe el nuevo valor calculado por el service y lo persiste:

- `true` → cuenta pública.
- `false` → cuenta privada.

## Responsabilidad
Su única responsabilidad en esta operación es actualizar `visibility` del usuario indicado. La lógica del toggle pertenece al service.

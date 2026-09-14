# Documentación - `requestPasswordRecovery` Service

## Objetivo

Este service gestiona la solicitud de recuperación de contraseña según el estado de la cuenta.

Solamente las cuentas activas pueden iniciar el flujo de recuperación. Las cuentas inactivas y suspendidas reciben un resultado específico para que el controller envíe el email correspondiente.

## Firma

```ts
requestPasswordRecovery: async (
    email: string
): Promise<
    {
        token?: string
        email: string
        result: "ok" | "inactive" | "suspended"
    } | void
>
```

## Flujo

1. Buscar el usuario mediante su email.
2. Si el usuario no existe, devolver `void`.
3. Si la cuenta está suspendida:
   - devolver `result: "suspended"`;
   - no generar ningún token.
4. Si la cuenta está inactiva:
   - devolver `result: "inactive"`;
   - no generar ningún token.
5. Si la cuenta está activa:
   - buscar un token existente asociado al usuario;
   - si existe, eliminarlo;
   - generar un nuevo token mediante `generateToken()`;
   - guardar únicamente el hash del token junto con su fecha de expiración;
   - devolver el token original, el email y `result: "ok"`.

## Estados

### Usuario inexistente

```ts
return
```

No se genera token ni se realiza ninguna operación sobre tokens existentes.

### Cuenta suspendida

```ts
{
    email: user.email,
    result: "suspended"
}
```

No se genera un token de recuperación.

La cuenta suspendida debe seguir el flujo correspondiente de suspensión y no puede solicitar recuperación de contraseña.

### Cuenta inactiva

```ts
{
    email: user.email,
    result: "inactive"
}
```

No se genera un token de recuperación.

La cuenta debe ser activada mediante el flujo administrativo correspondiente antes de poder solicitar una recuperación de contraseña.

### Cuenta activa

Si existe un token anterior, se elimina independientemente de si está vencido o no.

Luego se genera uno nuevo:

```ts
{
    token,
    email: user.email,
    result: "ok"
}
```

El token original se devuelve al controller para ser enviado por email. En la base de datos solamente se almacena `tokenHash`.

## Responsabilidades

### Service

- Buscar el usuario por email.
- Determinar el estado de la cuenta.
- Impedir la recuperación para cuentas inactivas o suspendidas.
- Reemplazar cualquier token de recuperación anterior para cuentas activas.
- Generar el nuevo token.
- Persistir únicamente el hash del token.
- Devolver el resultado necesario para que el controller determine qué email enviar.

### Controller

El controller interpreta el campo `result`:

- `ok` → `sendEmailPasswordRecovery()`.
- `inactive` → `sendInactiveAccountEmail()`.
- `suspended` → `sendSuspendedAccountEmail()`.

## Seguridad

- Si el usuario no existe, el service no devuelve información sobre la cuenta.
- Las cuentas inactivas y suspendidas no reciben tokens de recuperación.
- El token anterior de una cuenta activa se elimina antes de crear uno nuevo.
- No importa si el token anterior estaba vencido: una nueva solicitud reemplaza el token existente.
- Solamente el hash del token se almacena en la base de datos.
- El token original solamente se devuelve para permitir su envío mediante el email de recuperación.

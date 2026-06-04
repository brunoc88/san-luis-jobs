# CreateVerificationTokenData

## Descripción

Tipo utilizado para definir la estructura de datos requerida al momento de crear un nuevo registro de verificación dentro del repositorio de tokens.

Su objetivo es actuar como contrato entre la capa de servicios y la capa de persistencia, garantizando que la información enviada al repositorio sea consistente y posea los tipos esperados.

## Definición

```ts
type CreateVerificationTokenData = {
    token: string
    userId: number
    expiresAt: Date
}
```

## Propiedades

### token

Contiene el token hasheado que será almacenado en la base de datos.

Características:

- Corresponde al resultado de aplicar SHA-256 sobre el token original.
- Nunca almacena el token enviado al usuario en texto plano.
- Es utilizado posteriormente durante el proceso de validación.

### userId

Identificador del usuario asociado al token.

Este valor permite relacionar el registro de verificación con la cuenta que deberá ser activada una vez validado el token.

### expiresAt

Fecha y hora de expiración del token.

Este valor es utilizado para determinar si el token continúa siendo válido o si debe ser rechazado por haber superado su período de vigencia.

## Uso dentro del flujo

El tipo es utilizado durante el proceso de registro de usuarios.

```text
createAccount()
        │
        ▼
Generación de token
        │
        ▼
Hash del token
        │
        ▼
CreateVerificationTokenData
        │
        ▼
verificationTokenRepo.create()
```

## Beneficios

La utilización de este tipo permite:

- Garantizar que todos los campos requeridos estén presentes.
- Detectar errores de compilación de forma temprana.
- Documentar explícitamente los datos esperados por el repositorio.
- Reducir inconsistencias entre la capa de servicios y la capa de persistencia.

## Responsabilidad

La responsabilidad de este tipo es definir el contrato de creación de registros de verificación, asegurando que los datos enviados al repositorio de tokens cumplan la estructura necesaria para ser persistidos correctamente.

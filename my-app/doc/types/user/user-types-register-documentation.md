# User Type Definitions

## Descripción

Este módulo define los tipos utilizados durante el proceso de creación de usuarios.

Su objetivo es proporcionar contratos claros entre las distintas capas de la aplicación, garantizando que los datos intercambiados mantengan una estructura consistente y tipada.

## RegisterUserInput

```ts
type RegisterUserInput = {
    email: string,
    username: string,
    password: string,
    description: string | null
}
```

### Propósito

Este tipo representa los datos de entrada necesarios para registrar un nuevo usuario.

Es utilizado principalmente como contrato para los parámetros recibidos por la función `createAccount` del servicio de usuarios.

### Responsabilidad

Permite garantizar que la función reciba únicamente:

- Email
- Username
- Password
- Description

con los tipos de datos esperados.

### Beneficios

- Evita recibir propiedades inesperadas.
- Facilita el autocompletado y la navegación del código.
- Permite detectar errores durante el desarrollo.
- Documenta explícitamente qué información necesita la función para operar.

## CreateUserData

```ts
type CreateUserData = RegisterUserInput & {
    pic: string,
    picPublicId: string | null
}
```

### Propósito

Este tipo representa la estructura completa requerida para crear un usuario dentro del repositorio de persistencia.

Extiende `RegisterUserInput` agregando la información relacionada con la imagen de perfil.

### Propiedades adicionales

#### pic

Contiene la URL definitiva de la imagen asociada al usuario.

Puede corresponder a:

- Una imagen subida por el usuario.
- La imagen predeterminada configurada por la aplicación.

#### picPublicId

Contiene el identificador público del recurso almacenado.

Este valor es utilizado para operaciones posteriores como:

- Actualización de imagen.
- Eliminación de imagen.
- Rollback ante errores.

Puede ser `null` cuando el usuario utiliza la imagen predeterminada.

## Relación entre ambos tipos

El flujo de transformación es el siguiente:

```text
RegisterUserInput
        │
        ▼
createAccount()
        │
        ▼
Se agregan datos de imagen
        │
        ▼
CreateUserData
        │
        ▼
userRepo.create()
```

De esta manera, cada capa trabaja únicamente con la información que necesita.

## Responsabilidad

Estos tipos actúan como contratos de datos dentro del dominio de usuarios.

Su función principal es garantizar consistencia entre la capa de servicios y la capa de persistencia, reduciendo errores y mejorando la mantenibilidad del código.

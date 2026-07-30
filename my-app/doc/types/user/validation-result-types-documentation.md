# ValidationResult Types

## Descripción

Este módulo define los tipos de retorno utilizados por la función `validateUserRequest`.

Su objetivo es establecer un contrato explícito que permita identificar de forma segura si una validación fue exitosa o fallida, facilitando el consumo de la función por parte de las capas superiores.

## Estructura general

La validación puede producir dos resultados posibles:

- Error de validación.
- Validación exitosa.

Para representar ambos escenarios se utiliza una unión de tipos (`Union Type`).

```ts
type ValidationResult =
    | ValidationError
    | ValidationSuccess
```

## ValidationError

```ts
type ValidationError = {
    ok: false
    error: unknown
    status: number
}
```

### Propósito

Representa una validación fallida.

Este tipo es retornado cuando los datos recibidos no cumplen las reglas definidas por el esquema de validación.

### Propiedades

#### ok

Indica que la validación falló.

```ts
ok: false
```

#### error

Contiene la información asociada a los errores detectados durante la validación.

#### status

Representa el código HTTP sugerido para la respuesta.

Normalmente:

```ts
400
```

## ValidationSuccess

```ts
type ValidationSuccess = {
    ok: true
    data: RegisterUserInput
    file: File | null
    cvFile: File | null
}
```

### Propósito

Representa una validación exitosa.

Este tipo es retornado cuando todos los datos cumplen correctamente las reglas definidas por el esquema.

### Propiedades

#### ok

Indica que la validación fue exitosa.

```ts
ok: true
```

#### data

Contiene los datos ya validados y transformados.

Su estructura está definida mediante:

```ts
RegisterUserInput
```

lo que garantiza que únicamente información válida llegue a la capa de servicios.

#### file y cvFile

Contiene los archivos procesados por la función de validación.

Puede contener:

- Dos instancias válidas de `File`.
- `null` cuando no existe archivo asociado.

## Narrowing mediante discriminación

La propiedad `ok` actúa como discriminador de tipo.

Esto permite que TypeScript determine automáticamente qué estructura está disponible en cada rama de ejecución.

Ejemplo conceptual:

```ts
if (!validation.ok) {
    // ValidationError
    return validation.error
}

// ValidationSuccess
validation.data
validation.file
validation.cvFile
```

Este patrón mejora la seguridad de tipos y elimina la necesidad de realizar comprobaciones adicionales.

## Relación con validateUserRequest

El tipo `ValidationResult` representa el contrato completo de salida de la función `validateUserRequest`.

De esta manera, cualquier consumidor conoce exactamente qué estructura recibirá en cada escenario posible.

## Responsabilidad

La responsabilidad de estos tipos es documentar y tipar explícitamente los resultados producidos por la capa de validación, permitiendo una comunicación segura y consistente entre la validación de solicitudes y la lógica de negocio.

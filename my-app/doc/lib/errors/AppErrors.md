
# AppError y Errores de Dominio

## Descripción

Conjunto de **clases de errores personalizadas** utilizadas para manejar errores
de dominio y control de flujo dentro de la aplicación.

Estas clases permiten:
- Centralizar el manejo de errores.
- Asociar mensajes claros con códigos HTTP.
- Mantener controllers y services libres de lógica de respuesta.
- Integrarse con un `errorHandler` global.

---

## Jerarquía de Errores

```
Error
 └── AppError
      ├── BadRequestError (400)
      ├── UnAuthorizedError (401)
      ├── ForbiddenError (403)
      └── NotFoundError (404)
```

---

## Implementación

```ts
export class AppError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud inválida", status = 400) {
    super(message, status)
  }
}

export class UnAuthorizedError extends AppError {
  constructor(message = "Sin autorizacion") {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404)
  }
}
```

---

## Errores Disponibles

### AppError
- Clase base para todos los errores de dominio.
- Extiende de `Error` nativo.
- Contiene:
  - `message`: mensaje legible para el cliente.
  - `status`: código HTTP.

---

### BadRequestError — 400
- Indica una solicitud inválida.
- Casos de uso:
  - ID inválido.
  - Datos mal formateados.
  - Parámetros incorrectos.

---

### UnAuthorizedError — 401
- Indica que el usuario **no está autenticado**.
- Casos de uso:
  - No existe sesión activa.
  - Token inválido o inexistente.

---

### ForbiddenError — 403
- Indica que el usuario está autenticado pero **no tiene permiso**.
- Casos de uso:
  - Cuenta inactiva.
  - Rol insuficiente.
  - Acceso a recursos no permitidos.

---

### NotFoundError — 404
- Indica que un recurso no existe.
- Casos de uso:
  - Usuario inexistente.
  - Recurso eliminado previamente.
  - ID válido pero sin resultados.

---

## Buenas Prácticas

- Los errores se **lanzan** (`throw`) desde services o helpers.
- Los controllers **no deciden** el status HTTP.
- El `errorHandler` se encarga de transformar el error en respuesta HTTP.
- Evitar comparar strings de `error.message`.

---

## Notas

- Este diseño facilita el testing.
- Permite escalar fácilmente agregando nuevos errores.
- Mantiene separación clara entre dominio y transporte (HTTP).

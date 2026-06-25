# requireSession()

## Descripción

Función de dominio encargada de validar la existencia de una sesión autenticada.

Obtiene la sesión actual mediante NextAuth y retorna el identificador del usuario autenticado para ser utilizado en operaciones protegidas.

## Firma

```ts
requireSession(): Promise<number>
```

## Flujo

1. Obtiene la sesión actual mediante `getServerSession(authOptions)`.
2. Verifica que exista una sesión válida.
3. Verifica que la sesión contenga un identificador de usuario.
4. Convierte el identificador recibido a tipo numérico.
5. Valida que el identificador sea un número válido.
6. Retorna el identificador del usuario.

## Retorno

```ts
Promise<number>
```

Retorna:

| Valor | Descripción |
|---------|-------------|
| userId | Identificador del usuario autenticado |

## Reglas de negocio

- La operación requiere una sesión válida.
- La sesión debe contener un identificador de usuario.
- El identificador debe ser convertible a número.
- La función únicamente valida autenticación; no verifica existencia ni estado del usuario en la base de datos.

## Posibles errores

| Error | Descripción |
|---------|-------------|
| UnauthorizedError | No existe una sesión válida o la sesión no contiene un identificador de usuario |
| BadRequestError | El identificador almacenado en la sesión no es un número válido |
| InternalServerError | Error inesperado durante la obtención de la sesión |

## Casos de uso

Ejemplos de utilización:

- Crear locaciones.
- Obtener locaciones administrativas.
- Crear empleos.
- Modificar empleos.
- Postularse a empleos.
- Operaciones protegidas que requieren autenticación.

## Responsabilidades

Esta función valida únicamente la autenticación.

Las validaciones de:

- existencia del usuario,
- estado activo,
- permisos o roles,

deben realizarse posteriormente mediante funciones especializadas del dominio.

# GET /api/complaints — Controller

## Objetivo

El controller de `GET /api/complaints` recibe la petición, obtiene la sesión del usuario, valida el parámetro de paginación `page` y delega la obtención de las quejas al service.

## Flujo

1. Obtiene el `userId` mediante `requireSession()`.
2. Obtiene los query parameters mediante `req.nextUrl.searchParams`.
3. Obtiene el parámetro `page`.
4. Valida `page` utilizando `PageSchema`.
5. Si la validación falla, responde con **HTTP 400**.
6. Si la validación es correcta, obtiene el número de página.
7. Envía `userId` y `page` al service.
8. Recibe `complaints` y `hasNextPage`.
9. Devuelve ambos valores junto con `ok: true`.

## Parámetro `page`

El endpoint permite solicitar una página específica mediante un query parameter:

```text
GET /api/complaints?page=2
```

Si `page` no se proporciona, `PageSchema` utiliza `1` como valor predeterminado.

La validación se realiza antes de llamar al service, por lo que este recibe `page` como un número válido.

## Respuesta exitosa

La respuesta mantiene una estructura plana:

```json
{
  "ok": true,
  "complaints": [],
  "hasNextPage": true
}
```

El controller no contiene la lógica de paginación. Su responsabilidad es recibir y validar la entrada y delegar la operación al service.

## Manejo de errores

Los errores producidos durante la ejecución se envían al `errorHandler`, mientras que los errores de validación de `page` generan directamente una respuesta `400`.

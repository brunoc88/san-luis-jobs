# Endpoint - Crear empleo

## Ruta

`POST /api/job`

## Objetivo

Permite que un usuario autenticado publique una nueva oferta laboral.

## Flujo de ejecución

### 1. Verificación de sesión

Se obtiene el identificador del usuario autenticado mediante:

``` ts
const userId = await requireSession()
```

Si el usuario no posee una sesión válida, se interrumpe la ejecución y
se devuelve el error correspondiente.

> El `userId` nunca es enviado por el cliente; siempre se obtiene desde
> la sesión/JWT para evitar suplantaciones.

### 2. Validación del body

El cuerpo de la petición se valida utilizando `JobRegisterSchema`.

``` ts
const validate = await validateRequest(req, JobRegisterSchema)
```

Si la validación falla:

-   Se responde con **HTTP 400 (Bad Request)**.
-   Se devuelve el mensaje de error generado por Zod.

### 3. Creación del empleo

Si la información es válida, el endpoint delega toda la lógica de
negocio al servicio.

``` ts
const jobId = await jobService.create(userId, validate.data)
```

El servicio es responsable de:

-   verificar que el usuario exista y esté activo;
-   verificar que la ubicación exista y esté activa;
-   construir el objeto de creación;
-   persistir el empleo.

### 4. Respuesta exitosa

Si la operación finaliza correctamente se responde con **HTTP 201
(Created)**.

``` json
{
  "ok": true,
  "jobId": 15
}
```

## Manejo de errores

Todo el endpoint está envuelto en un bloque `try/catch`.

``` ts
catch (error) {
    return errorHandler(error)
}
```

## Responsabilidades

-   Verificar autenticación.
-   Validar el body recibido.
-   Invocar el servicio correspondiente.
-   Devolver la respuesta HTTP adecuada.

No contiene reglas de negocio; estas pertenecen al Service y al Domain.

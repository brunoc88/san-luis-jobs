# Endpoint - Crear empleo

## Ruta

`POST /api/jobs`

## Objetivo

Permite que un usuario autenticado publique una nueva oferta laboral.

## Flujo de ejecución

### 1. Verificación de sesión

Se obtiene el identificador del usuario autenticado mediante:

```ts
const userId = await requireSession()
```

Si el usuario no posee una sesión válida, se interrumpe la ejecución y

se devuelve el error correspondiente.

> El `userId` nunca es enviado por el cliente; siempre se obtiene desde

> la sesión/JWT para evitar suplantaciones.

### 2. Validación del body

El cuerpo de la petición se valida utilizando `JobRegisterSchema`.

```ts
const validate = await validateRequest(req, JobRegisterSchema)
```

Si la validación falla:

- Se responde con **HTTP 400 (Bad Request)**.
- Se devuelve el mensaje de error generado por Zod.

### 3. Rate Limit

Una vez validado correctamente el body, se aplica un límite de solicitudes utilizando el `userId` obtenido de la sesión.

El límite configurado es:

- **10 solicitudes por usuario cada 1 hora**.
- La clave utilizada es `create-job:user:${userId}`.

Si el usuario alcanza el límite:

- Se responde con **HTTP 429 (Too Many Requests)**.
- No se ejecuta la creación del empleo.

El rate limit se aplica después de la validación de Zod para evitar consumir intentos con solicitudes que ya contienen datos inválidos.

### 4. Creación del empleo

Si la información es válida y el usuario no alcanzó el límite, el endpoint delega toda la lógica de negocio al servicio.

```ts
const jobId = await jobService.create(userId, validate.data)
```

El servicio es responsable de:

- verificar que el usuario exista y esté activo;
- verificar que la ubicación exista y esté activa;
- construir el objeto de creación;
- persistir el empleo.

### 5. Respuesta exitosa

Si la operación finaliza correctamente se responde con **HTTP 201

(Created)**.

```json
{
  "ok": true,
  "jobId": 15
}
```

## Manejo de errores

Todo el endpoint está envuelto en un bloque `try/catch`.

```ts
catch (error) {
    return errorHandler(error)
}
```

## Responsabilidades

- Verificar autenticación.
- Validar el body recibido.
- Aplicar el rate limit correspondiente.
- Invocar el servicio correspondiente.
- Devolver la respuesta HTTP adecuada.

No contiene reglas de negocio; estas pertenecen al Service y al Domain.

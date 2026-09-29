# Documentación — PUT /api/jobs/:id

## Responsabilidad

Endpoint encargado de actualizar la información editable de un Job existente.

El manejo del estado de la publicación no forma parte de este endpoint. Para ello existe la operación específica de cambio de estado.

## Método y ruta

```http
PUT /api/jobs/:id
```

## Flujo

1. Obtiene la sesión mediante `requireSession()`.

2. Obtiene el `id` del Job desde los parámetros de la ruta.

3. Convierte y valida el identificador mediante `parseId`.

4. Valida el body utilizando `JobRegisterSchema`.

5. Si la validación falla, devuelve el error correspondiente.

6. Aplica el rate limit correspondiente al usuario autenticado.

7. Si el usuario alcanzó el límite, devuelve `429 Too Many Requests`.

8. Delega la operación a `jobService.editJob`.

9. Si la operación es exitosa, responde `200`.

10. Los errores inesperados o de negocio son procesados mediante `errorHandler`.

## Rate Limit

El endpoint aplica un límite por usuario autenticado utilizando el `userId` obtenido mediante `requireSession()`.

La configuración utilizada es:

* **20 solicitudes por usuario cada 1 hora.**
* Clave: `edit-job:user:${userId}`.

El rate limit se aplica después de la validación del body y antes de ejecutar `jobService.editJob()`.

Si el usuario alcanza el límite:

```http
429 Too Many Requests
```

```json
{
    "error": "Too many requests"
}
```

El contador es independiente para cada usuario autenticado.

## Código

```ts
export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const userId = await requireSession()
        let { id } = await params
        let jobId = parseId(id)

        const validate = await validateRequest(req, JobRegisterSchema)

        if (!validate.ok) {
            return NextResponse.json(
                { error: validate.error },
                { status: validate.status }
            )
        }

        const allowedByUserId = rateLimiter(
            `edit-job:user:${userId}`,
            rateLimitConfig.editJob.user.limit,
            rateLimitConfig.editJob.user.windowMs
        )

        if (!allowedByUserId) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            )
        }

        await jobService.editJob(userId, jobId, validate.data)

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        )
    } catch (error) {
        return errorHandler(error)
    }
}
```

## Validación del body

Se reutiliza `JobRegisterSchema` porque los campos y sus reglas de validación son los mismos que al registrar un Job.

Los campos opcionales tienen una semántica particular durante la edición:

* `salary` presente → actualiza el salario.
* `salary` ausente → el service lo interpreta como eliminación del salario y persiste `null`.
* `applicationLimit` presente → actualiza el límite.
* `applicationLimit` ausente → el service lo interpreta como eliminación del límite y persiste `null`.

La validación de reglas de negocio no corresponde al controller; se delega al service.

## Responsabilidades que NO corresponden al controller

El controller no determina:

* si el usuario es el autor del Job;
* si el usuario está habilitado para realizar la operación;
* si el Job puede ser editado;
* cuántos postulantes tiene el Job;
* si el nuevo `applicationLimit` es válido respecto de las postulaciones existentes;
* cómo se persisten los cambios.

Estas decisiones pertenecen al service y repository.

## Respuestas

### Éxito

```http
200 OK
```

```json
{
    "ok": true
}
```

### Error de validación

La respuesta depende de `validateRequest` y contiene el error y status correspondiente.

### Rate limit excedido

```http
429 Too Many Requests
```

```json
{
    "error": "Too many requests"
}
```

### Otros errores

Son delegados a `errorHandler`.

## Separación de responsabilidades

```text
PUT /api/jobs/:id

        ↓

Controller

        ↓

Validación del request

        ↓

Rate limit por usuario

        ↓

jobService.editJob(...)

        ↓

Reglas de negocio

        ↓

jobRepo.editJobById(...)

        ↓

Persistencia
```

# Documentación — GET /api/feedback

## Endpoint

**GET `/api/feedback`**

Endpoint encargado de obtener el listado paginado de feedbacks. El acceso requiere una sesión autenticada y posteriormente el usuario debe cumplir las reglas de autorización correspondientes.

---

## Rate Limit

El endpoint utiliza un rate limit basado en el usuario autenticado.

### Configuración

- **Límite:** 30 solicitudes
- **Ventana:** 1 minuto
- **Identificador:** `userId`
- **Clave:** `list-feedback:user:${userId}`

Al tratarse de un endpoint administrativo de lectura, el límite es más permisivo que el utilizado para operaciones que crean o eliminan información.

Si el usuario supera el límite establecido, el endpoint responde con **HTTP 429**.

El rate limit se aplica después de validar `page` y antes de ejecutar el service.

---

## Flujo general

La petición sigue el flujo:

**Controller → Service → Repository**

En el controller se obtiene la sesión, se lee y valida el parámetro `page`, se aplica el rate limit y se delega la obtención de los feedbacks al service.

---

## Controller

El endpoint recibe opcionalmente el parámetro de consulta `page`:

```text
GET /api/feedback?page=1
```

Si no se envía `page`, el esquema de validación utiliza el valor predeterminado `1`.

### 1. Obtener el usuario autenticado

Se utiliza `requireSession()` para obtener el `userId` de la sesión actual.

Esto permite que el service posteriormente compruebe que el usuario continúa existiendo y que tiene los permisos necesarios.

### 2. Obtener el query parameter

Se accede a los parámetros de búsqueda mediante:

```text
req.nextUrl.searchParams
```

Se obtiene `page` y, si no existe, se utiliza `undefined` para permitir que Zod aplique el valor por defecto.

### 3. Validar `page`

El parámetro se valida mediante `PageSchema`.

El esquema convierte el valor recibido desde el query string a número y exige que:

- sea un número;
- sea entero;
- sea mayor que 0;
- si no se proporciona, tenga como valor predeterminado `1`.

Si la validación falla, el controller responde con **HTTP 400**.

### 4. Aplicar rate limit

Una vez validado `page`, se aplica el rate limit utilizando el `userId` obtenido de la sesión.

Si el límite fue superado, se devuelve:

```json
{
  "error": "Too many requests"
}
```

con HTTP `429`.

### 5. Delegar al service

Una vez superado el rate limit, se llama al service pasando:

- `userId`
- `page`

El service devuelve dos elementos:

- `feedbacks`: listado de feedbacks de la página solicitada.
- `hasNextPage`: indica si existe una página posterior.

### 6. Respuesta

La respuesta exitosa tiene una estructura plana:

```json
{
  "ok": true,
  "feedbacks": [],
  "hasNextPage": true
}
```

Se evita devolver un objeto anidado como:

```text
feedbacks.feedbacks
```

Esto simplifica el consumo de la respuesta desde el frontend.

---

## Código actual del controller

```ts
export const GET = async (req: NextRequest) => {
  try {
    const userId = await requireSession()

    const searchParams = req.nextUrl.searchParams

    const validation = PageSchema.safeParse({
      page: searchParams.get("page") ?? undefined
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const page = validation.data.page

    const allowedByUserId = rateLimiter(
      `list-feedback:user:${userId}`,
      rateLimitConfig.getAllFeedbacks.user.limit,
      rateLimitConfig.getAllFeedbacks.user.windowMs
    )

    if (!allowedByUserId) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    const { feedbacks, hasNextPage } =
      await feedbackService.getAllFeedbacks(userId, page)

    return NextResponse.json(
      {
        ok: true,
        feedbacks,
        hasNextPage
      },
      { status: 200 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}
```

---

## Decisiones importantes

### ¿Por qué validar `page` en el controller?

`page` proviene directamente de los query parameters de la petición HTTP. Por lo tanto, el controller es el punto adecuado para validar y transformar ese dato antes de enviarlo al service.

El service recibe así un valor ya validado como número.

### ¿Por qué `page` es opcional?

Para que:

```text
GET /api/feedback
```

equivalga a:

```text
GET /api/feedback?page=1
```

Esto permite que el frontend no tenga que enviar explícitamente `page=1` para obtener la primera página.

### ¿Por qué la respuesta no contiene `feedbacks.feedbacks`?

El service puede trabajar internamente con un objeto que contenga tanto los registros como la información de paginación. El controller extrae ambas propiedades y construye la respuesta HTTP final.

De esta manera, el frontend recibe directamente:

```text
data.feedbacks

data.hasNextPage
```

en lugar de tener que acceder a propiedades anidadas.

### ¿Por qué el rate limit utiliza `userId`?

El endpoint requiere autenticación y además es exclusivo para administradores. Por lo tanto, el usuario autenticado es un identificador más apropiado que la IP para controlar el volumen de solicitudes.

El rate limit no reemplaza la autorización del service (`requireAdmin()`), sino que agrega una capa adicional de protección.

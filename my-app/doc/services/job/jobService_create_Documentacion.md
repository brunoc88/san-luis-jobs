# Documentación - jobService.create()

## Objetivo

El método `create()` implementa el caso de uso para publicar un nuevo
empleo.

Su responsabilidad es coordinar las reglas de negocio antes de persistir
la información en la base de datos.

No interactúa directamente con Prisma; esa responsabilidad pertenece al
Repository.

------------------------------------------------------------------------

# Flujo de ejecución

## 1. Verificar usuario

``` ts
const user = await requireActiveUserById(userId)
```

Antes de crear el empleo se comprueba que:

-   el usuario exista;
-   el usuario se encuentre activo.

En caso contrario, la función lanza la excepción correspondiente.

------------------------------------------------------------------------

## 2. Verificar ubicación

``` ts
await requireActiveLocationById(data.locationId)
```

Se valida que la ubicación enviada:

-   exista;
-   se encuentre activa.

Si la ubicación no cumple estas condiciones, la operación se interrumpe.

Esta regla de negocio pertenece al Domain, ya que puede ser reutilizada
por otros módulos.

------------------------------------------------------------------------

## 3. Construcción del objeto

``` ts
const { ...rest } = data

const jobToCreate = {
    ...rest,
    userId: user.id
}
```

El objeto recibido desde el cliente no contiene el `userId`.

El Service agrega automáticamente el identificador del usuario
autenticado antes de enviarlo al Repository.

De esta manera se evita que un cliente pueda crear empleos en nombre de
otro usuario.

------------------------------------------------------------------------

## 4. Persistencia

``` ts
const job = await jobRepo.create(jobToCreate)
```

La persistencia queda delegada completamente al Repository.

El Service no conoce detalles de Prisma ni de la base de datos.

------------------------------------------------------------------------

## 5. Resultado

``` ts
return job.id
```

Se devuelve únicamente el identificador del empleo creado.

El endpoint será el encargado de construir la respuesta HTTP.

------------------------------------------------------------------------

# Responsabilidades

-   Validar reglas de negocio.
-   Coordinar el flujo de creación.
-   Construir el objeto de persistencia.
-   Delegar el acceso a datos al Repository.

------------------------------------------------------------------------

# Decisiones de diseño

-   El `userId` nunca es recibido desde el cliente; se obtiene mediante
    la sesión autenticada.
-   La validación de la ubicación se realiza antes de intentar crear el
    empleo.
-   El Repository únicamente persiste información y no contiene reglas
    de negocio.
-   El Service actúa como capa de orquestación entre el Endpoint, el
    Domain y el Repository.

# Documentación - `requireActiveJobById()`

## Objetivo

`requireActiveJobById()` valida que un empleo pueda utilizarse dentro de
un caso de uso.

Verifica que:

-   Exista.
-   No haya sido eliminado lógicamente.
-   No se encuentre suspendido por un administrador.

Si alguna condición falla, lanza la excepción correspondiente.

------------------------------------------------------------------------

## Firma

``` ts
requireActiveJobById(id: number)
```

## Implementación

``` ts
export const requireActiveJobById = async (id: number) => {
    const job = await prisma.job.findUnique({ where: { id } })

    if (!job) throw new NotFoundError("job no encontrado")
    if (!job.isActive) throw new NotFoundError("job no encontrado")
    if (job.isSuspended) throw new ForbiddenError("job eliminado por violacion")

    return {
        id: job.id,
        autorId: job.userId
    }
}
```

## Flujo

1.  Buscar el empleo.
2.  Verificar que exista.
3.  Verificar que no haya sido eliminado (`isActive = false`).
4.  Verificar que no esté suspendido (`isSuspended = true`).
5.  Devolver únicamente `id` y `autorId`.

## Responsabilidades

-   Validar la existencia del empleo.
-   Validar que permanezca activo.
-   Validar que no haya sido suspendido.
-   Retornar solo la información necesaria para la lógica de negocio.

## Reglas de negocio

-   Un empleo inexistente y uno eliminado responden con **404 Not
    Found**.
-   Un empleo suspendido responde con **403 Forbidden**.
-   La verificación de permisos del usuario corresponde al Service.

## Decisión de diseño

La función pertenece a la capa **Domain**, centralizando las
validaciones reutilizables sobre un empleo y evitando duplicar reglas de
negocio en distintos Services.

# Documentación - jobService.reportJob()

## Descripción

El método `reportJob()` registra una denuncia realizada por un usuario
sobre una publicación de empleo.

Toda la lógica de negocio relacionada con las denuncias se centraliza en
este servicio.

------------------------------------------------------------------------

## Parámetros

  -----------------------------------------------------------------------------
  Parámetro                  Tipo                Descripción
  -------------------------- ------------------- ------------------------------
  `userId`                   `number`            Identificador del usuario
                                                 autenticado.

  `jobId`                    `number`            Identificador de la
                                                 publicación denunciada.

  `data.reason`              `ComplaintReason`   Motivo de la denuncia.

  `data.explanation`         `string \| null`    Explicación adicional de la
                                                 denuncia.
  -----------------------------------------------------------------------------

------------------------------------------------------------------------

## Flujo de ejecución

1.  Obtiene el usuario activo mediante `requireActiveUserById()`.
2.  Obtiene la publicación activa mediante `requireActiveJobById()`.
3.  Verifica que el usuario no sea el autor de la publicación.
4.  Comprueba si el usuario ya denunció esa publicación.
5.  Construye el objeto `Complaint`.
6.  Persiste la denuncia mediante `complaintRepo.create()`.

------------------------------------------------------------------------

## Reglas de negocio

### El usuario no puede denunciar su propia publicación

Si el usuario autenticado coincide con el autor de la publicación, se
lanza:

``` text
ForbiddenError
"No puedes denunciar tu propia publicación."
```

------------------------------------------------------------------------

### No se permiten denuncias duplicadas

Antes de registrar la denuncia se consulta el repositorio.

Si ya existe una denuncia del mismo usuario sobre la misma publicación,
se lanza:

``` text
ConflictError
"Ya has denunciado esta publicación."
```

Esta regla evita que un usuario registre múltiples denuncias sobre una
misma publicación.

------------------------------------------------------------------------

## Persistencia

Una vez superadas todas las validaciones, se crea el siguiente objeto:

``` ts
{
    userId,
    jobId,
    reason,
    explanation
}
```

El servicio delega el almacenamiento al repositorio:

``` ts
await complaintRepo.create(complaint)
```

------------------------------------------------------------------------

## Valor de retorno

``` ts
Promise<void>
```

No retorna información. Si la operación finaliza correctamente, la
denuncia queda registrada en la base de datos.

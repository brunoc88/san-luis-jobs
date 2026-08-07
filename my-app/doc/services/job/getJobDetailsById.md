# `getJobDetailsById`

Obtiene la información detallada de una publicación de empleo. Si el
usuario está autenticado, la respuesta se complementa con información
personalizada, como si ya se postuló al empleo y la cantidad de
postulantes cuando la publicación posee un límite de aplicaciones.

## Firma

``` ts
getJobDetailsById(
    jobId: number,
    userId?: number | null
): Promise<JobDetailsDto>
```

## Parámetros

  ----------------------------------------------------------------------------
  Parámetro                  Tipo               Descripción
  -------------------------- ------------------ ------------------------------
  `jobId`                    `number`           Identificador de la
                                                publicación.

  `userId`                   `number \| null`   Identificador del usuario
                             *(opcional)*       autenticado. Si no se envía,
                                                únicamente se devuelve la
                                                información pública del
                                                empleo.
  ----------------------------------------------------------------------------

## Flujo de ejecución

1.  Verifica que la publicación exista y se encuentre activa mediante
    `requireActiveJobById`.
2.  Obtiene la información detallada del empleo utilizando el
    repositorio.
3.  Si por algún motivo no se obtiene la información, lanza
    `NotFoundError`.
4.  Construye un objeto `JobDetailsDto` con la información pública del
    empleo.
5.  Si existe un usuario autenticado:
    -   Verifica que el usuario continúe activo.
    -   Determina si el usuario ya se postuló al empleo.
    -   Agrega la propiedad `alreadyApplied` con un valor booleano.
    -   Si la publicación tiene un límite de postulaciones configurado,
        calcula la cantidad actual de postulantes y agrega
        `numberOfApplicants`.
6.  Devuelve el objeto con la información del empleo.

## Información pública

Siempre se devuelve:

-   ID de la publicación.
-   Autor (nombre de usuario e imagen).
-   Título.
-   Estado.
-   Fecha de creación.
-   Ubicación.
-   Modalidad.
-   Jornada laboral.
-   Salario.
-   Descripción.

## Información personalizada

Cuando el usuario está autenticado pueden incluirse los siguientes
campos:

  ---------------------------------------------------------------------------
  Campo                  Tipo             Descripción
  ---------------------- ---------------- -----------------------------------
  `alreadyApplied`       `boolean`        Indica si el usuario autenticado ya
                                          se postuló a la publicación.

  `numberOfApplicants`   `number`         Cantidad de postulantes. Solo se
                                          incluye cuando la publicación posee
                                          un límite de aplicaciones
                                          configurado.
  ---------------------------------------------------------------------------

## Valor de retorno

Devuelve un objeto de tipo `JobDetailsDto`.

## Excepciones

  -----------------------------------------------------------------------
  Excepción                        Descripción
  -------------------------------- --------------------------------------
  `NotFoundError`                  La publicación no existe o no pudo
                                   recuperarse correctamente.

  Errores propagados por           La publicación no existe, está
  `requireActiveJobById`           inactiva o suspendida.

  Errores propagados por           El usuario autenticado no existe o se
  `requireActiveUserById`          encuentra inactivo.
  -----------------------------------------------------------------------

## Responsabilidades

-   Validar que la publicación sea accesible.
-   Construir el DTO de respuesta.
-   Enriquecer la respuesta cuando existe un usuario autenticado.
-   Delegar el acceso a datos al repositorio y las validaciones a los
    helpers de dominio.

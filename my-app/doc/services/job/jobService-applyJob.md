# `jobService.applyJob`

## Descripción

Gestiona el proceso de postulación de un usuario a una publicación de
empleo.

## Reglas de negocio

1.  Verifica que el usuario exista y se encuentre activo.
2.  Verifica que la publicación exista y se encuentre activa.
3.  Solo permite postularse a publicaciones con estado `active`.
4.  Impide que el autor se postule a su propia publicación.
5.  Verifica que el usuario tenga un CV cargado.
6.  Comprueba que el usuario no se haya postulado previamente a la misma
    publicación.
7.  Registra la postulación.
8.  Si la publicación tiene un límite de postulaciones y este se alcanza
    con la nueva postulación, cambia el estado del job a `completed`.
9.  Envía un correo electrónico al autor de la publicación con:
    -   Email del postulante.
    -   Título de la publicación.
    -   Enlace al CV del postulante.

## Posibles excepciones

  -----------------------------------------------------------------------
  Excepción                                 Motivo
  ----------------------------------------- -----------------------------
  `ForbiddenError`                          La publicación no está
                                            activa.

  `ForbiddenError`                          El autor intenta postularse a
                                            su propia publicación.

  `BadRequestError`                         El usuario no posee un CV
                                            cargado.

  `ConflictError`                           El usuario ya se postuló a la
                                            publicación.
  -----------------------------------------------------------------------

## Flujo

``` text
Usuario
   │
   ▼
Validar usuario y publicación
   │
   ▼
Validar estado del job
   │
   ▼
Validar que no sea el autor
   │
   ▼
Validar CV
   │
   ▼
Validar postulación previa
   │
   ▼
Crear postulación
   │
   ├── ¿Hay límite de postulaciones?
   │         │
   │         └── Sí → ¿Se alcanzó el límite?
   │                     │
   │                     └── Finalizar publicación
   │
   ▼
Enviar email al autor
```

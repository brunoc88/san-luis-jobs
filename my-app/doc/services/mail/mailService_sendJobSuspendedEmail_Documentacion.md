# Documentación - `mailService.sendJobSuspendedEmail()`

## Objetivo

Envía un correo electrónico notificando al autor que una publicación de
empleo fue suspendida por incumplir las normas de la plataforma.

## Firma

``` ts
sendJobSuspendedEmail(
    email: string,
    jobTitle: string,
    reason: string
)
```

## Parámetros

-   **email**: dirección de correo del autor.
-   **jobTitle**: título de la publicación suspendida.
-   **reason**: motivo de la suspensión definido por el administrador.

## Contenido del correo

El mensaje informa:

-   Que la publicación fue suspendida.
-   El título del empleo afectado.
-   El motivo de la suspensión.
-   Que la advertencia quedará registrada en la cuenta.
-   Que puede contactar al soporte si considera que se trata de un
    error.

## Asunto

    Publicación suspendida

## Responsabilidad

Esta función únicamente construye y envía el correo utilizando el
`transporter`.

No contiene reglas de negocio ni decide cuándo debe enviarse; esa
responsabilidad corresponde al `jobService.suspendJob()`.

## Uso

Se invoca cuando una publicación es suspendida y el autor aún no alcanzó
el límite de advertencias que provoca la suspensión de la cuenta.

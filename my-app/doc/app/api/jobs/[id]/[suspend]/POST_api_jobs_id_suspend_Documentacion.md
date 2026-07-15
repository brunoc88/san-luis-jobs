# Documentación - `POST /api/jobs/:id/suspend`

## Objetivo

Suspende una publicación de empleo mediante una acción administrativa.

Durante el proceso pueden ejecutarse reglas de negocio adicionales, como
la creación de una advertencia, la suspensión de la cuenta del autor y
el envío de notificaciones por correo.

## Flujo

1.  Verificar la sesión con `requireSession()`.
2.  Validar el parámetro `id` con `parseId()`.
3.  Validar el body con `SuspensionReasonSchema`.
4.  Delegar la lógica a `jobService.suspendJob()`.
5.  Responder **201 Created**.

## Request

``` json
{
  "reason": "Motivo de la suspensión."
}
```

## Respuesta

``` json
{
  "ok": true
}
```

## Responsabilidades

-   Autenticar al usuario.
-   Validar el ID.
-   Validar el body.
-   Delegar la lógica de negocio al Service.
-   Devolver la respuesta HTTP.

## Nota de diseño

La suspensión se modela como una acción administrativa (`POST`) porque,
además de modificar el empleo, crea una advertencia y puede suspender la
cuenta del autor.

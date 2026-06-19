# Documentación - `mailService.sendPasswordChangedEmail()`

## Objetivo

Notificar al usuario que la contraseña de su cuenta fue actualizada
correctamente.

Este correo constituye una medida adicional de seguridad, permitiendo al
usuario detectar cambios no autorizados en caso de que no haya sido
quien realizó la operación.

------------------------------------------------------------------------

## Flujo de ejecución

1.  Recibir la dirección de correo del usuario.
2.  Construir el contenido del mensaje de confirmación.
3.  Enviar el correo electrónico mediante el `transporter` de
    Nodemailer.

------------------------------------------------------------------------

## Parámetros

### `email`

Dirección de correo electrónico del usuario que recibirá la
notificación.

------------------------------------------------------------------------

## Contenido del correo

El mensaje informa que:

-   La contraseña fue actualizada correctamente.
-   Si el usuario realizó el cambio, no necesita realizar ninguna acción
    adicional.
-   Si no reconoce la actividad, debe contactar al soporte lo antes
    posible.

El correo no incluye enlaces, tokens ni información sensible.

------------------------------------------------------------------------

## Responsabilidades

-   Generar el contenido del correo de confirmación.
-   Enviar la notificación utilizando Nodemailer.

No realiza validaciones ni lógica de negocio.

------------------------------------------------------------------------

## Consideraciones de seguridad

-   El correo actúa como una medida de alerta ante posibles cambios no
    autorizados.
-   No contiene la contraseña nueva ni ningún dato sensible.
-   No incluye enlaces de acción, ya que el cambio de contraseña ya fue
    completado.
-   Su envío se realiza únicamente después de que la contraseña haya
    sido actualizada correctamente.

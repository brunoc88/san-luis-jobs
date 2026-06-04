# mailService.sendEmailVerification

## Descripción

Función responsable de enviar el correo electrónico de verificación utilizado durante el proceso de activación de cuentas.

Su objetivo es generar el enlace de confirmación utilizando el token previamente creado y enviarlo al correo electrónico del usuario mediante el servicio de transporte configurado.

## Flujo de ejecución

1. Se reciben el correo electrónico del usuario y el token de verificación.
2. Se construye la URL de confirmación utilizando la dirección del frontend configurada mediante variables de entorno.
3. El token es incorporado como parámetro de consulta (`query parameter`) dentro del enlace.
4. Se prepara el contenido del correo electrónico.
5. Se envía el mensaje utilizando el transportador de correo configurado.
6. El usuario recibe un enlace que le permitirá confirmar y activar su cuenta.

## Construcción del enlace

La URL de confirmación se genera dinámicamente utilizando la variable de entorno correspondiente al frontend.

Ejemplo conceptual:

```text
https://frontend.com/confirm?token=TOKEN_GENERADO
```

Este enfoque permite:

- Separar frontend y backend.
- Adaptar fácilmente la aplicación a distintos entornos.
- Mantener configurable la dirección de destino.

## Contenido del correo

El mensaje enviado incluye:

- Remitente configurado por la aplicación.
- Destinatario correspondiente al usuario registrado.
- Asunto de confirmación de cuenta.
- Enlace de activación.

El cuerpo del correo contiene una URL única asociada al proceso de verificación del usuario.

## Seguridad

El enlace enviado contiene el token generado durante el registro.

Este token:

- Es único para cada solicitud.
- Posee una fecha de expiración definida previamente.
- Será validado posteriormente por el sistema de activación de cuentas.
- Se encuentra almacenado de forma hasheada en la base de datos.

## Dependencias

### Transporter

La función utiliza una instancia de transporte de correo previamente configurada.

Esta abstracción permite desacoplar la lógica de negocio de la implementación concreta del proveedor de correo electrónico.

## Responsabilidad

La responsabilidad de esta función se limita exclusivamente al envío del correo de verificación.

No realiza validaciones de usuarios ni genera tokens, sino que actúa como una capa especializada de comunicación encargada de entregar el enlace de activación al usuario final.

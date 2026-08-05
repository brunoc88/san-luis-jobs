# Documentación - mailService.sendApplicationEmail()

## Descripción

El método `sendApplicationEmail()` envía un correo electrónico al autor
de una publicación cuando un usuario realiza una postulación.

El correo informa la recepción de la postulación e incluye un enlace
para descargar el CV del postulante.

------------------------------------------------------------------------

## Parámetros

  ------------------------------------------------------------------------
  Parámetro                  Tipo           Descripción
  -------------------------- -------------- ------------------------------
  `authorEmail`              `string`       Correo electrónico del autor
                                            de la publicación.

  `applicantEmail`           `string`       Correo electrónico del usuario
                                            postulante.

  `jobTitle`                 `string`       Título de la publicación.

  `cvUrl`                    `string`       URL pública desde donde puede
                                            descargarse el CV del
                                            postulante.
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## Flujo de ejecución

1.  Construye el correo utilizando el transportador de Nodemailer.
2.  Envía el mensaje al correo del autor de la publicación.
3.  Incluye el título de la publicación.
4.  Incluye el correo electrónico del postulante.
5.  Incluye un enlace para descargar el CV del postulante.

------------------------------------------------------------------------

## Contenido del correo

El correo contiene la siguiente información:

-   Saludo inicial.
-   Confirmación de que se recibió una nueva postulación.
-   Título de la publicación.
-   Correo electrónico del postulante.
-   Enlace para descargar el CV.
-   Mensaje de despedida del equipo de San Luis Jobs.

------------------------------------------------------------------------

## Asunto

``` text
Nueva postulación recibida
```

------------------------------------------------------------------------

## Destinatario

``` text
authorEmail
```

------------------------------------------------------------------------

## Valor de retorno

``` ts
Promise<SentMessageInfo>
```

El método retorna la promesa generada por `transporter.sendMail()`,
permitiendo conocer el resultado del envío o capturar posibles errores.

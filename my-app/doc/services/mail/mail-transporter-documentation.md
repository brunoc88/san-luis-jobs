# Mail Transport Configuration

## Descripción

Configuración del transportador de correo electrónico utilizado por la aplicación para el envío de emails transaccionales.

Esta instancia es utilizada por los distintos servicios de correo para entregar mensajes como:

- Verificación de cuenta.
- Recuperación de contraseña.
- Notificaciones futuras relacionadas con autenticación.

## Implementación

La configuración se realiza mediante `nodemailer` utilizando el protocolo SMTP.

El transportador es creado una única vez y posteriormente reutilizado por los servicios encargados de enviar correos electrónicos.

## Configuración SMTP

La aplicación utiliza el servidor SMTP de Gmail con los siguientes parámetros:

| Propiedad | Valor |
|------------|---------|
| Host | smtp.gmail.com |
| Puerto | 587 |
| Secure | false |

La comunicación utiliza el puerto estándar para conexiones SMTP con soporte para STARTTLS.

## Credenciales

Las credenciales no se encuentran hardcodeadas dentro de la aplicación.

Se obtienen mediante variables de entorno:

```env
MAIL_USER=correo@dominio.com
MAIL_PASS=contraseña_o_app_password
```

Este enfoque permite:

- Evitar exponer credenciales en el código fuente.
- Utilizar diferentes configuraciones según el entorno.
- Facilitar despliegues en desarrollo, testing y producción.

## Seguridad

La configuración delega la autenticación al proveedor SMTP mediante usuario y contraseña.

Las credenciales deben almacenarse de forma segura y nunca ser versionadas dentro del repositorio.

Se recomienda utilizar:

- Variables de entorno.
- Secret managers.
- Credenciales específicas para aplicaciones cuando el proveedor lo permita.

## Responsabilidad

La responsabilidad de este módulo es exclusivamente crear y exportar una instancia configurada de transporte SMTP.

No contiene lógica de negocio ni composición de correos electrónicos, actuando únicamente como infraestructura compartida para los servicios de mailing de la aplicación.

# Documentación - `mailService.sendAccountSuspendedEmail()`

## Objetivo

Envía un correo electrónico informando al usuario que su cuenta fue suspendida debido a la acumulación de advertencias por incumplimiento de las normas de la plataforma.

---

## Firma

```ts
sendAccountSuspendedEmail(email: string)
```

---

## Parámetros

- **email**: dirección de correo electrónico del usuario cuya cuenta fue suspendida.

---

## Contenido del correo

El mensaje informa:

- Que la cuenta fue suspendida.
- Que la suspensión se produjo por acumulación de advertencias.
- Que mientras la suspensión permanezca activa no podrá acceder a su cuenta ni publicar nuevas ofertas de empleo.
- Que puede comunicarse con el equipo de soporte si considera que la suspensión fue un error.

---

## Asunto

```text
Cuenta suspendida
```

---

## Responsabilidad

Esta función únicamente construye y envía el correo electrónico utilizando el `transporter`.

No contiene reglas de negocio ni determina cuándo debe enviarse; esa decisión corresponde al `jobService.suspendJob()`.

---

## Uso

Se invoca cuando un usuario alcanza el límite de advertencias establecido por la plataforma y su cuenta es suspendida automáticamente.
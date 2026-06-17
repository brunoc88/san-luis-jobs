# Diferencia entre `token` y `tokenHash`

Cuando generamos un token para activación de cuenta o recuperación de
contraseña, en realidad trabajamos con **dos valores distintos**.

## 1. Token original

``` ts
const token = crypto.randomBytes(32).toString("hex")
```

Este es el valor que se envía al usuario por email.

## 2. Token hasheado

``` ts
const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")
```

Este valor es el que se guarda en la base de datos.

## Flujo correcto

1.  Generar `token`, `tokenHash` y `expiresAt`.
2.  Guardar `tokenHash` en la base.
3.  Enviar `token` por email.

## ¿Por qué se hace así?

Si alguien obtiene acceso a la base de datos, no podrá utilizar
directamente el hash para acceder al enlace enviado al usuario.

Cuando el usuario hace clic en el enlace:

1.  El backend recibe el token original.
2.  Calcula nuevamente el SHA-256.
3.  Busca ese hash en la base de datos.
4.  Si coincide y no expiró, el token es válido.

## Resumen

-   `token`: se envía al usuario.
-   `tokenHash`: se almacena en la base de datos.
-   No son lo mismo.
-   Nunca debe enviarse el hash por email.
-   Nunca debería almacenarse el token original.

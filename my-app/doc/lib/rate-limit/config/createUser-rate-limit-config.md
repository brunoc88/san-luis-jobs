# createUser Rate Limit Configuration

## Descripción

Configuración del rate limit correspondiente al proceso de creación de usuarios.

Esta configuración define la cantidad máxima de intentos permitidos y la duración de la ventana de tiempo durante la cual se contabilizan dichos intentos.

## Configuración

```ts
createUser: {
    ip: {
        limit: 3,
        windowMs: 60 * 60 * 1000
    }
}
```

## Parámetros

### `limit`

Define la cantidad máxima de intentos permitidos dentro de la ventana de tiempo configurada.

En este caso:

- `limit: 3`
- Se permiten hasta **3 intentos**.

### `windowMs`

Define la duración de la ventana de tiempo en milisegundos.

En este caso:

```ts
60 * 60 * 1000
```

corresponde a **1 hora**.

Por lo tanto, los intentos se contabilizan dentro de una ventana de una hora.

## Funcionamiento

La configuración es utilizada por `rateLimiter`, que recibe estos valores para controlar los intentos de creación de usuarios.

Con la configuración actual:

- Se permiten hasta 3 intentos.
- Los intentos se contabilizan durante una ventana de 1 hora.
- Una vez alcanzado el límite, nuevas solicitudes son rechazadas mientras la ventana continúe activa.
- Cuando la ventana expira, el contador se reinicia.

## Responsabilidades

### `createUser`

- Definir la configuración del rate limit para la creación de usuarios.
- Establecer el límite de intentos permitido.
- Establecer la duración de la ventana de tiempo.

### `rateLimiter`

- Utilizar esta configuración para determinar si una solicitud puede continuar.

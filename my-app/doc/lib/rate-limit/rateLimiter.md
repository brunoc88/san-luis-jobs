# rateLimiter

## Descripción

Función encargada de controlar la cantidad de peticiones permitidas para una determinada clave durante un período de tiempo definido.

El rate limit se mantiene en memoria mediante un `Map`, donde cada clave almacena la cantidad de peticiones realizadas y el momento en que comenzó la ventana de tiempo actual.

## Estructura

Cada entrada almacenada en el `Map` utiliza la siguiente estructura:

- `count`: cantidad de peticiones realizadas durante la ventana actual.
- `startTime`: momento en el que comenzó la ventana de tiempo actual, expresado mediante `Date.now()`.

## Parámetros

La función recibe:

- `key`: identificador utilizado para llevar el conteo de peticiones. En el caso del rate limit por IP, corresponde a la dirección IP del cliente.
- `limit`: cantidad máxima de peticiones permitidas dentro de la ventana de tiempo.
- `windowMs`: duración de la ventana de tiempo en milisegundos.

## Flujo de ejecución

1. Se obtiene el momento actual mediante `Date.now()`.

2. Se busca en `requests` una entrada asociada a la `key` recibida.

3. Si no existe una entrada para la `key`:
   - Se crea una nueva entrada.
   - Se establece `count` en `1`.
   - Se establece `startTime` con el momento actual.
   - Se retorna `true`.

4. Si existe una entrada, se verifica si la ventana de tiempo ha expirado.

5. Si la ventana ha expirado:
   - Se reinicia el contador.
   - Se establece `count` en `1`.
   - Se actualiza `startTime`.
   - Se retorna `true`.

6. Si la ventana todavía está activa y `entry.count` alcanzó el límite configurado:
   - Se retorna `false`.
   - La nueva petición no es permitida.

7. Si la ventana todavía está activa y el límite no fue alcanzado:
   - Se incrementa `entry.count`.
   - Se retorna `true`.

## Retorno

La función retorna un valor booleano:

- `true`: la petición está permitida.
- `false`: la petición supera el límite establecido para la ventana de tiempo actual.

## Almacenamiento

El seguimiento de las peticiones se realiza mediante:

`Map<string, RateLimitEntry>`

El almacenamiento es en memoria y utiliza la `key` recibida para identificar cada contador de forma independiente.

## Responsabilidades

### rateLimiter

- Controlar la cantidad de peticiones realizadas por cada `key`.
- Crear el registro inicial de una nueva `key`.
- Reiniciar el contador cuando finaliza la ventana de tiempo.
- Bloquear nuevas peticiones cuando se alcanza el límite.
- Permitir peticiones mientras no se haya alcanzado el límite.

## Uso

La función es utilizada por los endpoints que necesitan limitar la cantidad de peticiones realizadas por un cliente.

En el caso de la creación de usuarios, se utiliza la dirección IP obtenida mediante `getClientIp` como `key`.

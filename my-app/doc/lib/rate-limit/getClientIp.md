# getClientIp

## Descripción

Función encargada de obtener la dirección IP del cliente a partir de los headers de una solicitud HTTP.

La función contempla tanto objetos `Headers` como objetos de headers representados mediante `Record<string, any>`.

## Flujo de ejecución

1. Se recibe el objeto `headers`, que puede ser:
   - Una instancia de `Headers`.
   - Un objeto con los headers de la solicitud.
   - `undefined`.

2. Se obtiene el valor del header `x-forwarded-for`:
   - Si `headers` es una instancia de `Headers`, se utiliza `headers.get("x-forwarded-for")`.
   - En caso contrario, se accede mediante `headers?.["x-forwarded-for"]`.

3. Si el header `x-forwarded-for` no existe o no contiene un valor:
   - La función retorna `null`.

4. Si el header contiene una o más direcciones IP:
   - Se separa el contenido utilizando `,`.
   - Se obtiene la primera dirección IP.
   - Se eliminan los espacios innecesarios mediante `trim()`.

5. La función retorna la dirección IP obtenida.

## Retorno

La función puede retornar:

- `string`: dirección IP del cliente obtenida desde `x-forwarded-for`.
- `null`: cuando no existe el header `x-forwarded-for` o no contiene un valor.

## Responsabilidades

### getClientIp

- Obtener la dirección IP a partir del header `x-forwarded-for`.
- Soportar diferentes representaciones del objeto de headers.
- Extraer la primera IP cuando el header contiene múltiples direcciones.
- Retornar `null` cuando no es posible obtener una IP.

## Uso

Esta función es utilizada por el Route Handler para identificar al cliente antes de aplicar el rate limit por dirección IP.

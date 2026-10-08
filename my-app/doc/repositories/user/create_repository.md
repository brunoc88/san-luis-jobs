# userRepo.create

## Descripción

Función encargada de crear un nuevo registro de usuario en la base de datos.

La función recibe los datos previamente preparados por la capa de servicio y utiliza Prisma para persistirlos en la tabla `User`.

## Parámetros

### `data`

Corresponde a un objeto de tipo `CreateUserData` que contiene la información necesaria para crear el usuario.

Los datos recibidos son enviados directamente a Prisma mediante la propiedad `data`.

## Flujo de ejecución

1. Se recibe un objeto `CreateUserData`.

2. Se ejecuta `prisma.user.create`.

3. Los datos recibidos se proporcionan a Prisma mediante la propiedad `data`.

4. Prisma crea el registro correspondiente en la base de datos.

5. Se devuelve el usuario creado.

## Estructura de retorno

La función retorna una `Promise<User>`.

Esto significa que, una vez completada la operación, se obtiene el registro de usuario creado con la estructura definida por el tipo `User`.

## Responsabilidad

Esta función pertenece a la capa de repositorio y tiene como responsabilidad persistir un nuevo usuario en la base de datos.

La función no contiene lógica de negocio ni validaciones propias. Recibe los datos preparados por las capas superiores y delega la operación de persistencia directamente en Prisma.

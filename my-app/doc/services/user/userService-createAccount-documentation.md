# userService.createAccount

## Descripción

Función responsable de crear una nueva cuenta de usuario dentro del sistema.

Además de persistir la información del usuario, esta función se encarga de:

- Hashear la contraseña.
- Gestionar la imagen de perfil.
- Crear el registro del usuario.
- Generar el token de verificación de cuenta.
- Almacenar el token de forma segura.
- Implementar mecanismos de rollback ante fallos durante el proceso.

## Flujo de ejecución

1. Se reciben los datos validados del usuario y un archivo de imagen opcional.
2. La contraseña es hasheada utilizando `bcrypt` antes de ser almacenada.
3. Se inicializan los valores de imagen por defecto definidos por la aplicación.
4. Si el usuario proporciona una imagen:
   - Se carga al servicio de almacenamiento mediante `uploadImage`.
   - Se obtiene la URL pública de la imagen.
   - Se obtiene el identificador público necesario para futuras operaciones.
5. Se construye el objeto `CreateUserData` con la información definitiva del usuario.
6. Se crea el usuario mediante `userRepo.create`.
7. Se genera un token de verificación aleatorio utilizando criptografía segura.
8. El token generado es hasheado utilizando SHA-256.
9. Se calcula la fecha de expiración del token.
10. Se almacena el token hasheado mediante `verificationTokenRepo.create`.
11. Se devuelve el email del usuario y el token original para su posterior envío por correo electrónico.

## Gestión de contraseñas

Antes de persistir la información del usuario, la contraseña es procesada mediante `bcrypt`.

Este enfoque permite:

- Evitar almacenar contraseñas en texto plano.
- Incrementar la seguridad ante filtraciones de base de datos.
- Verificar credenciales posteriormente mediante comparación de hashes.

## Gestión de imágenes

La función soporta imágenes de perfil opcionales.

### Sin imagen

Si el usuario no proporciona una imagen:

- Se utiliza una imagen predeterminada configurada mediante variables de entorno.
- No se genera un identificador público asociado.

### Con imagen

Si el usuario proporciona una imagen:

- La imagen es subida al proveedor de almacenamiento configurado.
- Se almacena la URL pública.
- Se almacena el identificador público para futuras operaciones de actualización o eliminación.

## Generación del token de verificación

Una vez creado el usuario se genera un token aleatorio de verificación.

### Token original

El token original es generado mediante un generador criptográficamente seguro.

Este token:

- Será enviado al usuario por correo electrónico.
- Nunca es almacenado directamente en la base de datos.

### Token almacenado

Antes de persistirlo, el token es transformado mediante SHA-256.

Esto permite:

- Evitar almacenar tokens sensibles en texto plano.
- Reducir el impacto de una posible filtración de la base de datos.
- Mantener un mecanismo seguro de validación posterior.

## Expiración del token

Los tokens de verificación poseen una vigencia limitada.

Actualmente la expiración se establece en:

- 24 horas desde el momento de su creación.

Una vez superado este período, el token deja de ser válido.

## Rollback ante errores

Toda la operación se encuentra protegida mediante un bloque `try/catch`.

Si ocurre un error después de haber subido una imagen pero antes de completar correctamente el proceso:

1. Se elimina la imagen previamente subida.
2. Se evita la generación de recursos huérfanos en el sistema de almacenamiento.
3. La excepción es propagada para ser gestionada por capas superiores.

## Estructura de retorno

```ts
{
  email: string,
  token: string
}
```

## Responsabilidad

Esta función concentra la lógica de negocio necesaria para registrar una nueva cuenta de usuario y preparar el proceso de verificación de correo electrónico, garantizando consistencia entre la base de datos, el almacenamiento de imágenes y el sistema de tokens.

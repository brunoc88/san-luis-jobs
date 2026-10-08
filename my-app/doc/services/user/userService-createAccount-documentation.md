# userService.createAccount

## Descripción

Función responsable de crear una nueva cuenta de usuario dentro del sistema.

Además de persistir la información del usuario, esta función se encarga de:

- Hashear la contraseña.
- Gestionar la imagen de perfil.
- Gestionar el archivo con el CV.
- Crear el registro del usuario.
- Generar el token de verificación de cuenta.
- Almacenar el token de forma segura.
- Implementar mecanismos de rollback ante fallos durante el proceso.

## Flujo de ejecución

1. Se reciben los datos validados del usuario, un archivo de imagen y un archivo CV, ambos opcionales.

2. La contraseña es hasheada utilizando `bcrypt` antes de ser almacenada.

3. Se inicializan los valores de imagen utilizando `/default-avatar.png` como imagen predeterminada.

4. Si el usuario proporciona una imagen:
   - Se carga mediante `uploadFile`.
   - Se utiliza la carpeta `users`.
   - Se establece un tamaño máximo de 5 MB.
   - Se permiten los tipos `image/jpeg`, `image/png` y `image/webp`.
   - Se utiliza `resourceType: "image"`.
   - Se obtiene la URL pública del archivo.
   - Se obtiene el identificador público necesario para futuras operaciones.

5. Si el usuario proporciona un CV:
   - Se carga mediante `uploadFile`.
   - Se utiliza la carpeta `users-cv`.
   - Se establece un tamaño máximo de 10 MB.
   - Se permiten los tipos `application/pdf`, `application/msword` y `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
   - Se utiliza `resourceType: "raw"`.
   - Se obtiene la URL pública del archivo.
   - Se obtiene el identificador público necesario para futuras operaciones.

6. Se construye el objeto `CreateUserData` con la información definitiva del usuario.

7. Se crea el usuario mediante `userRepo.create`.

8. Se genera un token de verificación aleatorio utilizando criptografía segura.

9. El token generado es hasheado utilizando SHA-256.

10. Se calcula la fecha de expiración del token.

11. Se almacena el token hasheado mediante `verificationTokenRepo.create`.

12. Se devuelve el email del usuario y el token original para su posterior envío por correo electrónico.

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

- Se utiliza `/default-avatar.png` como imagen predeterminada de la aplicación.
- No se genera un identificador público asociado.
- La imagen predeterminada no se sube al proveedor de almacenamiento.

### Con imagen

Si el usuario proporciona una imagen:

- La imagen es subida mediante `uploadFile`.
- Se almacena la URL pública.
- Se almacena el identificador público para futuras operaciones de actualización o eliminación.
- La imagen se almacena en la carpeta `users`.

Los límites establecidos para la imagen son:

- Tamaño máximo: 5 MB.
- Tipos permitidos: JPEG, PNG y WebP.

## Gestión de CV

El CV es opcional.

### Sin CV

Si el usuario no proporciona un archivo para el CV:

- `cv` se guarda como `null`.
- `cvPublicId` se mantiene como `null`.

### Con CV

Si el usuario proporciona un CV:

- El archivo es subido mediante `uploadFile`.
- Se almacena la URL pública.
- Se almacena el identificador público para futuras operaciones de actualización o eliminación.
- El archivo se almacena en la carpeta `users-cv`.

Los límites establecidos para el CV son:

- Tamaño máximo: 10 MB.
- Tipos permitidos: PDF, DOC y DOCX.

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

Si ocurre un error después de haber subido una imagen o un CV:

1. Se elimina la imagen previamente subida, si existe.
2. Se elimina el CV previamente subido, si existe.
3. Se evita la generación de recursos huérfanos en el sistema de almacenamiento.
4. La excepción es propagada para ser gestionada por capas superiores.

La imagen predeterminada `/default-avatar.png` no requiere rollback, ya que no se almacena en el proveedor de almacenamiento.

## Estructura de retorno

```ts
{
    email: string,
    token: string
}
```

## Responsabilidad

Esta función concentra la lógica de negocio necesaria para registrar una nueva cuenta de usuario y preparar el proceso de verificación de correo electrónico, garantizando consistencia entre la base de datos, el almacenamiento de imágenes, CV y el sistema de tokens.

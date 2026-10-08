# validateUserRequest

## Descripción

Función encargada de validar los datos recibidos durante el proceso de registro de usuarios.

Su objetivo es extraer la información enviada mediante `FormData`, transformarla a un formato compatible con el esquema de validación y verificar que los datos cumplan las reglas definidas por la aplicación antes de continuar con la creación de la cuenta.

Además, prepara los archivos opcionales recibidos desde el formulario para su posterior procesamiento en la capa de servicios.

## Flujo de ejecución

1. Se recibe un objeto `FormData` proveniente de la solicitud HTTP.

2. Se extraen los campos esperados:
   - Email
   - Username
   - Password
   - Confirmación de password
   - Descripción

3. Cada valor es convertido a `string`.

4. Si algún campo no existe en el formulario, se asigna una cadena vacía como valor por defecto.

5. Se obtienen los campos `file` y `cvFile` de manera independiente.

6. Se verifica que los archivos recibidos sean una instancia válida de `File` y que su tamaño sea mayor a `0`.

7. Si un archivo no cumple estas condiciones, se asigna `null`.

8. Los datos son validados mediante `userRegisterSchema` utilizando `safeParse`.

9. Si la validación falla:
   - Se devuelve `ok: false`.
   - Se incluyen los errores agrupados por campo.
   - Se devuelve el código de estado `400`.

10. Si la validación es exitosa:
    - Se obtiene la información validada y tipada por Zod.
    - Se elimina `password2` de los datos que serán enviados al servicio.
    - Se adjuntan los archivos procesados (`file` y `cvFile`).
    - Se devuelve `ok: true`.

## Validación de datos

La validación se realiza mediante el esquema `userRegisterSchema`, utilizando el método `safeParse`.

Este enfoque permite:

- Validar la estructura completa de los datos.
- Obtener errores detallados por campo.
- Evitar excepciones durante el proceso de validación.
- Garantizar que la capa de servicios reciba únicamente datos válidos.

La confirmación de password (`password2`) participa en la validación, pero no forma parte de los datos enviados posteriormente al servicio.

## Manejo de archivos

Los archivos recibidos no forman parte del esquema de validación principal.

Su procesamiento se realiza de manera independiente mediante una comprobación de tipo y tamaño:

- Si el valor recibido es una instancia válida de `File` y su tamaño es mayor a `0`, se conserva.
- En cualquier otro caso se asigna `null`.

Los archivos procesados son:

- `file`: archivo correspondiente a la imagen de perfil.
- `cvFile`: archivo correspondiente al CV.

Ambos archivos son opcionales.

Esta función no realiza la validación de tipo MIME ni del tamaño máximo permitido para los archivos. Estas validaciones se realizan posteriormente durante el procesamiento de los archivos en la capa correspondiente.

## Estructura de respuesta

### Validación fallida

```ts
{
    ok: false,
    error: {
        field: ["mensaje de error"]
    },
    status: 400
}
```

### Validación exitosa

```ts
{
    ok: true,
    data: validatedDataWithoutPassword2,
    file,
    cvFile
}
```

## Responsabilidad

Esta función actúa como una capa intermedia entre la solicitud HTTP y la lógica de negocio, garantizando que únicamente datos válidos lleguen a los servicios encargados de crear la cuenta de usuario.

Sus responsabilidades principales son:

- Extraer los datos del `FormData`.
- Preparar los valores recibidos para la validación.
- Validar los datos mediante `userRegisterSchema`.
- Preparar los archivos opcionales.
- Excluir `password2` de los datos enviados al servicio.
- Devolver una estructura uniforme de validación.

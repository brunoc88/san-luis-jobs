# validateUserRequest

## Descripción

Función encargada de validar los datos recibidos durante el proceso de registro de usuarios.

Su objetivo es extraer la información enviada mediante `FormData`, transformarla a un formato compatible con el esquema de validación y verificar que los datos cumplan las reglas definidas por la aplicación antes de continuar con la creación de la cuenta.

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
5. Se obtiene el campo `file` de manera independiente.
6. Se verifica que el archivo recibido sea una instancia válida de `File`.
7. Si la validación del archivo falla, se asigna `null`.
8. Los datos son validados mediante `userRegisterSchema`.
9. Si la validación falla:
   - Se devuelve `ok: false`.
   - Se incluyen los errores agrupados por campo.
   - Se devuelve el código de estado `400`.
10. Si la validación es exitosa:
    - Se devuelve `ok: true`.
    - Se incluyen los datos ya validados y tipados por Zod.
    - Se adjunta el archivo procesado para su uso posterior.

## Validación de datos

La validación se realiza mediante el esquema `userRegisterSchema`, utilizando el método `safeParse`.

Este enfoque permite:

- Validar la estructura completa de los datos.
- Obtener errores detallados por campo.
- Evitar excepciones durante el proceso de validación.
- Garantizar que la capa de servicios reciba únicamente datos válidos.

## Manejo de archivos

El archivo recibido no forma parte del esquema de validación principal.

Su procesamiento se realiza de manera independiente mediante una comprobación de tipo:

- Si el valor recibido es una instancia válida de `File`, se conserva.
- En cualquier otro caso se asigna `null`.

Esto permite desacoplar la validación de datos textuales de la gestión de archivos.

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
  data: validatedData,
  file
}
```

## Responsabilidad

Esta función actúa como una capa intermedia entre la solicitud HTTP y la lógica de negocio, garantizando que únicamente datos válidos lleguen a los servicios encargados de crear la cuenta de usuario.

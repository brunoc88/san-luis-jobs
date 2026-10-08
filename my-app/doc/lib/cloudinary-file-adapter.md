# Cloudinary File Adapter

## Descripción

Adaptador encargado de gestionar la subida y eliminación de archivos utilizando Cloudinary.

La implementación centraliza la configuración de Cloudinary y proporciona dos operaciones principales:

- `uploadFile`: subir archivos y obtener sus datos públicos.
- `deleteFile`: eliminar archivos previamente almacenados.

La subida también incorpora validaciones de tamaño y tipo MIME antes de enviar el archivo a Cloudinary.

## Configuración

Cloudinary se configura utilizando variables de entorno:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Estas variables son utilizadas para establecer la conexión con el servicio de almacenamiento.

## UploadResult

El resultado de una subida exitosa utiliza la siguiente estructura:

```ts
{
    url: string,
    publicId: string
}
```

- `url`: URL segura del archivo almacenado.
- `publicId`: identificador público utilizado para futuras operaciones sobre el archivo.

## UploadOptions

La función `uploadFile` recibe una configuración que define cómo debe procesarse el archivo.

### `folder`

Define la carpeta de Cloudinary donde será almacenado el archivo.

### `maxSize`

Define el tamaño máximo permitido para el archivo.

### `allowedMimeTypes`

Define los tipos MIME permitidos para el archivo.

### `resourceType`

Define el tipo de recurso que utilizará Cloudinary:

- `image`: utilizado para imágenes.
- `raw`: utilizado para archivos como documentos.

## uploadFile

### Descripción

Función encargada de validar y subir un archivo a Cloudinary.

### Flujo de ejecución

1. Se recibe un objeto `File` y las opciones de configuración.

2. Se verifica que el tamaño del archivo no supere `maxSize`.

3. Si el archivo supera el tamaño permitido:
   - Se lanza un `BadRequestError`.
   - Se utiliza el mensaje `"El archivo supera el tamaño máximo permitido"`.

4. Se verifica que el tipo MIME del archivo se encuentre dentro de `allowedMimeTypes`.

5. Si el tipo MIME no está permitido:
   - Se lanza un `BadRequestError`.
   - Se utiliza el mensaje `"El tipo de archivo no está permitido"`.

6. El archivo es convertido a un `Buffer` mediante `arrayBuffer()`.

7. Se inicia la subida mediante `cloudinary.uploader.upload_stream`.

8. Se utilizan las opciones `folder` y `resourceType` para determinar cómo almacenar el archivo.

9. Si Cloudinary devuelve un error o no devuelve un resultado:
   - La operación es rechazada.
   - Se propaga el error correspondiente.

10. Si la subida es exitosa:
    - Se obtiene `secure_url`.
    - Se obtiene `public_id`.
    - Se devuelve un `UploadResult`.

## Validaciones de archivos

La función realiza dos validaciones antes de subir el archivo:

### Tamaño

El archivo no puede superar el valor establecido en `maxSize`.

### Tipo MIME

El tipo MIME del archivo debe encontrarse dentro de la lista definida en `allowedMimeTypes`.

Estas validaciones permiten que cada operación configure sus propios límites y tipos de archivo permitidos.

## deleteFile

### Descripción

Función encargada de eliminar un archivo previamente almacenado en Cloudinary.

### Parámetros

- `publicId`: identificador público del archivo que se desea eliminar.
- `resourceType`: tipo de recurso almacenado, que puede ser `image` o `raw`.

### Flujo de ejecución

1. Se recibe el `publicId` del archivo.
2. Se recibe el tipo de recurso correspondiente.
3. Se ejecuta `cloudinary.uploader.destroy`.
4. Cloudinary elimina el recurso identificado.

## Manejo de errores

Los errores relacionados con las validaciones de tamaño y tipo MIME se gestionan mediante `BadRequestError`.

Los errores producidos durante la comunicación con Cloudinary son propagados para que puedan ser gestionados por las capas superiores.

## Responsabilidades

### uploadFile

- Validar el tamaño del archivo.
- Validar el tipo MIME.
- Convertir el archivo a un `Buffer`.
- Subir el archivo a Cloudinary.
- Retornar la URL segura y el identificador público.

### deleteFile

- Eliminar un archivo almacenado en Cloudinary mediante su `publicId`.
- Utilizar el `resourceType` correspondiente.

### Adaptador

- Centralizar la interacción con Cloudinary.
- Evitar que las capas de negocio tengan que manejar directamente la API de Cloudinary.

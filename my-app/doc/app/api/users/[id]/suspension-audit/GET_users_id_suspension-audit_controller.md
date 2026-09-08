# GET /users/[id]/suspension-audit — Controller

## Descripción

El controller del endpoint `GET /users/[id]/suspension-audit` recibe la solicitud para consultar la auditoría de suspensión de un usuario y delega la lógica de negocio al `adminService`.

El controller no determina si el usuario tiene permisos para consultar la auditoría ni valida las reglas relacionadas con la suspensión. Estas responsabilidades pertenecen al service.

## Flujo

### 1. Obtener la sesión

Se obtiene el ID del usuario autenticado mediante:

`requireSession()`

Este ID identifica al usuario que realiza la solicitud.

### 2. Obtener el ID de la ruta

Se obtiene el parámetro `id` de la URL mediante `params`.

El valor corresponde al ID del usuario cuya suspensión se desea consultar.

### 3. Parsear el ID

El parámetro recibido se convierte y valida mediante:

`parseId(id)`

El resultado se utiliza como `suspendedUserId`.

### 4. Delegar al service

Se llama a:

`adminService.getUserAuditById(userId, suspendedUserId)`

El controller entrega al service tanto el usuario que realiza la solicitud como el usuario cuya suspensión se desea auditar.

La validación de permisos, existencia del usuario, estado de suspensión y demás reglas de negocio son responsabilidad del service.

### 5. Retornar la respuesta

Si la operación finaliza correctamente, se devuelve una respuesta HTTP `200` con:

```ts
{
    ok: true,
    audit
}
```

### 6. Manejo de errores

Cualquier error producido durante el procesamiento es capturado y enviado a:

`errorHandler(error)`

El controller no procesa individualmente los errores de negocio.

## Responsabilidades del controller

El controller es responsable de:

- obtener la sesión;
- obtener el parámetro `id`;
- parsear y validar el ID recibido;
- llamar al service correspondiente;
- construir la respuesta HTTP exitosa;
- delegar el manejo de errores al `errorHandler`.

## Responsabilidades que no pertenecen al controller

El controller no:

- verifica el rol `superAdmin`;
- verifica si el usuario objetivo existe;
- verifica si está suspendido;
- decide quién puede consultar la auditoría;
- consulta directamente la base de datos;
- transforma los datos de auditoría.

Estas responsabilidades se encuentran en las capas correspondientes, principalmente en el service y repository.

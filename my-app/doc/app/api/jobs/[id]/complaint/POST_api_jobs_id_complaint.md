# Documentación del Endpoint

## POST `/api/jobs/:id/complaint`

Permite a un usuario autenticado denunciar una publicación de empleo.

### Autenticación

Requiere una sesión válida.

------------------------------------------------------------------------

## Parámetros de la ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `number` | Identificador de la publicación a denunciar. |

------------------------------------------------------------------------

## Rate Limit

El endpoint aplica un límite de solicitudes por usuario autenticado.

- **Límite:** 5 solicitudes.
- **Ventana:** 1 hora.
- **Criterio:** `userId`.
- **Clave:** `report-job:user:${userId}`.
- Cuando el usuario supera el límite, el endpoint responde con `429 Too Many Requests`.

El límite se aplica después de verificar la sesión, validar el ID de la publicación y validar el cuerpo de la petición, antes de ejecutar `jobService.reportJob()`.

------------------------------------------------------------------------

## Flujo del endpoint

1. Verifica que el usuario tenga una sesión activa mediante
   `requireSession()`.

2. Obtiene el parámetro `id` de la URL.

3. Convierte el parámetro a entero utilizando `parseId()`.

4. Valida el cuerpo de la petición con `ComplaintRegisterSchema`.

5. Si la validación falla, responde con **400 Bad Request**.

6. Aplica el rate limit correspondiente al usuario autenticado.

7. Si el usuario supera el límite, responde con **429 Too Many Requests**.

8. Si la validación es correcta y el rate limit lo permite, delega la lógica
   de negocio al servicio `jobService.reportJob(...)`.

9. Si la operación finaliza correctamente, responde con **201 Created**.

------------------------------------------------------------------------

## Body esperado

```json
{
  "reason": "FALSE_INFORMATION",
  "explanation": "Descripción opcional del motivo."
}
```

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `reason` | `ComplaintReason` | Sí | Motivo de la denuncia. |
| `explanation` | `string` | Condicional | Obligatorio únicamente cuando `reason` es `OTHER`. Máximo 150 caracteres. |

------------------------------------------------------------------------

## Respuestas

### 201 Created

```json
{
  "ok": true
}
```

### 400 Bad Request

Se devuelve cuando:

- El cuerpo de la petición no cumple con el esquema de validación.
- El motivo de la denuncia es inválido.
- La explicación no cumple las reglas definidas por el esquema.

### 429 Too Many Requests

Se devuelve cuando el usuario supera el límite de solicitudes permitido.

### Errores delegados al servicio

El servicio puede devolver errores como:

- Usuario intenta denunciar su propia publicación.
- La publicación ya fue denunciada anteriormente por el mismo usuario.
- Usuario o publicación inexistentes o inactivos.

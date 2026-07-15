# Documentación - `jobService.suspendJob()`

## Objetivo

Implementa la lógica de negocio para suspender una publicación de empleo
por parte de un administrador.

Además de suspender el empleo, puede generar una advertencia, suspender
la cuenta del autor y enviar la notificación correspondiente.

## Firma

``` ts
suspendJob(userId: number, jobId: number, data: { reason: string }): Promise<void>
```

## Flujo

1.  Validar el usuario autenticado.
2.  Validar el empleo.
3.  Verificar que el usuario sea administrador.
4.  Aplicar las reglas de jerarquía.
5.  Suspender la publicación.
6.  Crear una advertencia.
7.  Contar advertencias del autor.
8.  Si alcanza el límite, suspender la cuenta; en caso contrario, enviar
    el correo de suspensión del empleo.

## Reglas de negocio

-   Solo administradores pueden suspender publicaciones.
-   Un administrador no puede suspender su propia publicación.
-   Un administrador no puede suspender a otro administrador.
-   Un administrador no puede suspender a un Super Administrador.
-   Cada suspensión genera una advertencia.
-   Al alcanzar cinco advertencias la cuenta del autor queda suspendida.
-   Solo se envía un correo por operación.

## Arquitectura

``` text
POST /api/jobs/:id/suspend
        │
        ▼
jobService.suspendJob()
        │
        ├── requireActiveUserById()
        ├── requireActiveJobById()
        ├── requireAdmin()
        ├── Validación de jerarquía
        ├── jobRepo.suspend()
        ├── warningRepo.create()
        ├── warningRepo.count()
        ├── userRepo.suspend() (si corresponde)
        └── mailService
```

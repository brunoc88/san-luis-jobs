# `getUserSavedJobs`

## Responsabilidad

Obtiene los trabajos guardados por un usuario, aplicando las reglas de acceso, búsqueda, ordenamiento y paginación correspondientes.

## Flujo

1. Verifica que el usuario que realiza la consulta esté activo.
2. Busca al usuario objetivo mediante su `username`.
3. Si el usuario objetivo no existe, lanza `NotFoundError`.
4. Verifica que el usuario autenticado sea el propietario del perfil solicitado.
5. Si otro usuario intenta consultar los trabajos guardados, lanza `ForbiddenError`.
6. Consulta los trabajos guardados del usuario.
7. Aplica una paginación fija de **5 registros por página**.
8. Aplica el parámetro `search` cuando está presente.
9. Aplica el criterio de ordenamiento:
   - `recent`
   - `alphabetical`
10. Solicita un registro adicional para determinar si existe una página siguiente.
11. Calcula `hasNextPage` según la cantidad de registros obtenidos.
12. Limita la respuesta a un máximo de 5 trabajos.
13. Devuelve de cada trabajo:
    - `id`
    - `title`
    - `state`
    - `date`
14. Devuelve los trabajos junto con `hasNextPage`.

## Acceso

Los trabajos guardados son información privada del usuario.

- El propietario puede consultar sus propios trabajos guardados.
- Cualquier otro usuario recibe `ForbiddenError`.

## Paginación

La función utiliza **5 registros por página** y solicita un registro adicional para determinar si existe una página siguiente, evitando realizar una consulta adicional para obtener el total de registros.

## Errores

- Usuario que realiza la consulta inexistente o inactivo: gestionado por la validación de usuario activo.
- Usuario objetivo inexistente: `NotFoundError`.
- Usuario diferente al propietario intentando consultar los trabajos guardados: `ForbiddenError`.

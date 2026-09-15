# `getUserJobs`

## Responsabilidad

Obtiene los trabajos activos y no suspendidos asociados a un usuario, respetando las reglas de privacidad del perfil y aplicando búsqueda, ordenamiento y paginación.

## Flujo

1. Verifica que el usuario que realiza la consulta esté activo.
2. Busca al usuario objetivo mediante su `username`.
3. Si el usuario objetivo no existe, lanza `NotFoundError`.
4. Si el perfil del usuario objetivo es privado y quien consulta no es el propio usuario, lanza `ForbiddenError`.
5. Consulta los trabajos activos y no suspendidos del usuario objetivo.
6. Aplica una paginación fija de **5 registros por página**.
7. Aplica el parámetro `search` cuando está presente.
8. Aplica el criterio de ordenamiento:
   - `recent`
   - `alphabetical`
9. Solicita un registro adicional para determinar si existe una página siguiente.
10. Calcula `hasNextPage` según la cantidad de registros obtenidos.
11. Limita la respuesta a un máximo de 5 trabajos.
12. Devuelve de cada trabajo:
   - `id`
   - `title`
   - `date`
13. El campo `state` solamente se incluye cuando quien consulta es el propietario del perfil.
14. Devuelve los trabajos junto con `hasNextPage`.

## Reglas de privacidad

- El propietario puede consultar sus propios trabajos aunque su perfil sea privado.
- Otros usuarios solamente pueden consultar los trabajos cuando el perfil del usuario objetivo es público.
- El `state` de los trabajos solo se expone al propietario.

## Paginación

La función utiliza **5 registros por página** y solicita un registro adicional para determinar si existe una página siguiente, sin necesidad de realizar una consulta adicional para obtener el total de registros.

## Errores

- Usuario que realiza la consulta inexistente o inactivo: gestionado por la validación de usuario activo.
- Usuario objetivo inexistente: `NotFoundError`.
- Perfil privado consultado por otro usuario: `ForbiddenError`.

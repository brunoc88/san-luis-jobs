# Services `getUserInfo`

### Responsabilidad

`getUserInfo` obtiene y prepara la información de un usuario para ser devuelta por el endpoint de perfil.

### Flujo

1. Verifica que el usuario que realiza la petición exista y se encuentre activo mediante `requireActiveUserById(id)`.
2. Busca al usuario solicitado mediante `userRepo.findByUsername(username)`.
3. Si el usuario solicitado no existe, lanza `NotFoundError`.
4. Construye un objeto `UserInfoDto` inicial con:
   - `username`
   - `pic`
   - `isPublic`
5. Si quien consulta no es el propio usuario y el perfil es privado, devuelve únicamente la información pública inicial.
6. Si el perfil puede mostrar información adicional, agrega:
   - `email`
   - `description`
7. Devuelve el objeto `UserInfoDto`.

### Regla de privacidad

Un usuario puede consultar su propia información completa.

Cuando consulta otra persona:

- Si el perfil es público, se devuelve también `email` y `description`.
- Si el perfil es privado, se devuelve únicamente `username`, `pic` e `isPublic`.

### Errores

- Si el usuario solicitado no existe → `NotFoundError`.
- La validación de que el usuario que realiza la petición esté activo se delega en `requireActiveUserById`.

# `getOptionalSessionUser`

Helper utilizado para obtener la información del usuario autenticado
cuando la sesión es **opcional**.

## Objetivo

Permite que un endpoint público adapte su respuesta si el usuario inició
sesión, sin exigir autenticación ni lanzar errores cuando no existe una
sesión válida.

## Implementación

``` ts
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

const getOptionalSessionUser = async () => {
    const session = await getServerSession(authOptions)

    const id = Number(session?.user?.id)

    if (Number.isNaN(id)) return null

    return {
        id,
        role: session.user.role
    }
}

export default getOptionalSessionUser
```

## Retorno

### Usuario autenticado

``` ts
{
    id: 1,
    role: "admin"
}
```

### Sin sesión o sesión inválida

``` ts
null
```

## Casos de uso

Este helper es ideal para endpoints públicos que pueden enriquecer su
respuesta cuando existe un usuario autenticado, por ejemplo:

-   Mostrar si el usuario ya se postuló a un empleo.
-   Indicar si un empleo fue guardado por el usuario.
-   Devolver información personalizada sin requerir autenticación.

## Diferencia con `requireSession()`

  -----------------------------------------------------------------------
  `getOptionalSessionUser()`                `requireSession()`
  ----------------------------------------- -----------------------------
  La sesión es opcional.                    La sesión es obligatoria.

  Devuelve `null` si no existe sesión       Lanza `UnauthorizedError` si
  válida.                                   no hay sesión.

  Se utiliza en endpoints públicos.         Se utiliza en endpoints
                                            protegidos.
  -----------------------------------------------------------------------

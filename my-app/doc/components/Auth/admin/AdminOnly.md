# Componente AdminOnly

## ¿Para qué sirve?

`AdminOnly` es un componente de protección visual del frontend. Su función es permitir que el contenido que recibe mediante `children` se muestre únicamente cuando existe una sesión iniciada y el usuario tiene un rol administrativo.

En este proyecto se permiten los roles `admin` y `superAdmin`. El rol `common` no debe acceder al panel.

> Importante: `AdminOnly` no reemplaza la autorización del servidor. Los endpoints y las operaciones administrativas también deben validar la sesión y el rol en el backend.

## Estados de sesión de NextAuth

`useSession()` devuelve un estado que puede ser:

- `loading`: NextAuth todavía está comprobando la sesión.
- `unauthenticated`: terminó la comprobación y no hay una sesión iniciada.
- `authenticated`: hay una sesión iniciada.

No hay que confundir `loading` con `unauthenticated`: mientras se comprueba la sesión, todavía no sabemos si el usuario está autenticado.

## Flujo esperado

| Estado | Rol | Comportamiento |
|---|---|---|
| `loading` | Cualquiera | Mostrar «Cargando...» |
| `unauthenticated` | — | Redirigir |
| `authenticated` | `common` | Redirigir |
| `authenticated` | `admin` | Permitir mostrar `children` |
| `authenticated` | `superAdmin` | Permitir mostrar `children` |

## Implementación

```tsx
'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AdminOnlyProps {
  children: React.ReactNode
  redirectTo?: string
}

const AdminOnly = ({ children, redirectTo = "/" }: AdminOnlyProps) => {
  const { data, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(redirectTo)
    }

    if (status === "authenticated" && data.user.role === "common") {
      router.replace(redirectTo)
    }
  }, [status, data, router, redirectTo])

  if (status === "loading" || status === "unauthenticated") {
    return <p>Cargando...</p>
  }

  if (data?.user.role === "common") {
    return <p>Cargando...</p>
  }

  return children
}

export default AdminOnly
```

## ¿Por qué se comprueba cada estado por separado?

### 1. Esperar mientras carga

```tsx
if (status === "loading") {
  return <p>Cargando...</p>
}
```

Mientras NextAuth comprueba la sesión, no se debe redirigir al usuario como si no estuviera autenticado.

### 2. Redirigir cuando no hay sesión

```tsx
if (status === "unauthenticated") {
  router.replace(redirectTo)
}
```

Esta condición se cumple solamente cuando NextAuth terminó de comprobar la sesión y confirmó que no hay una sesión iniciada.

### 3. Redirigir al usuario común

```tsx
if (status === "authenticated" && data.user.role === "common") {
  router.replace(redirectTo)
}
```

Estar autenticado no significa tener permisos administrativos. Por eso también se comprueba el rol.

### 4. Permitir el acceso administrativo

Si la sesión está autenticada y el rol es `admin` o `superAdmin`, el componente llega a:

```tsx
return children
```

Así se muestra el contenido protegido.

## Error que se debe evitar

Esta condición es incorrecta para el estado de carga:

```tsx
if (status !== "authenticated") {
  router.push("/")
}
```

`status !== "authenticated"` también se cumple cuando `status` es `loading`. Eso puede provocar una redirección antes de que NextAuth termine de comprobar la sesión.

También hay que evitar:

```tsx
if (status === "loading" || status === "authenticated") {
  return <p>Cargando...</p>
}
```

Porque `authenticated` incluye a los administradores. En ese caso nunca se mostrarían sus `children`.

## Idea clave

`AdminOnly` decide qué contenido puede mostrar el frontend según la sesión y el rol. La autorización real debe mantenerse también en el backend.

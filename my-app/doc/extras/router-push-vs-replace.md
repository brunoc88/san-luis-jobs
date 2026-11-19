# Diferencia entre `router.push()` y `router.replace()`

En Next.js, ambos métodos permiten navegar a otra ruta mediante el enrutador. La diferencia principal está en cómo modifican el historial de navegación del navegador.

## `router.push()`

Agrega una nueva entrada al historial.

```tsx
router.push("/")
```

Ejemplo:

1. El usuario está en `/admin`.
2. Se ejecuta `router.push("/")`.
3. El usuario llega a `/`.
4. Si presiona «Atrás», puede volver a `/admin`, porque esa ruta quedó en el historial.

Se utiliza cuando queremos navegar a otra página y conservar la ruta anterior como parte del recorrido.

## `router.replace()`

Reemplaza la entrada actual del historial por la nueva ruta.

```tsx
router.replace("/")
```

Ejemplo:

1. El usuario está en `/admin`.
2. Se ejecuta `router.replace("/")`.
3. El usuario llega a `/`.
4. Si presiona «Atrás», no vuelve a `/admin` mediante esa entrada reemplazada.

Se utiliza cuando no queremos conservar la ruta actual como un paso anterior de navegación.

## Comparación

| Característica | `push()` | `replace()` |
|---|---|---|
| Navega a otra ruta | Sí | Sí |
| Agrega una entrada al historial | Sí | No |
| Reemplaza la entrada actual | No | Sí |
| «Atrás» puede volver a la ruta anterior | Sí | No, respecto de la entrada reemplazada |

## ¿Cuál conviene usar en `AdminOnly`?

Para redirigir a un usuario que no tiene permiso para entrar al panel, `router.replace()` suele ser más apropiado.

```tsx
if (status === "unauthenticated") {
  router.replace(redirectTo)
}
```

La intención es reemplazar la ruta protegida por el destino de redirección, en lugar de dejar la ruta rechazada como el paso anterior del historial.

Lo mismo puede aplicarse cuando el usuario tiene el rol `common`.

## Idea clave

- `push()`: navegar y conservar la ruta actual en el historial.
- `replace()`: navegar y reemplazar la ruta actual en el historial.

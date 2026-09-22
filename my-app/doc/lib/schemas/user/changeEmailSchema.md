# changeEmailSchema

## Propósito

Valida el nuevo email enviado por el usuario al solicitar un cambio de email.

- Debe ser un `string`.
- Debe tener formato de email válido.
- Es obligatorio.

```ts
export const changeEmailSchema = z.object({
    email: z
        .string()
        .email('email invalido')
        .nonempty('debe ingresar un email')
})
```

El schema valida formato y presencia. La disponibilidad del email se comprueba en el service.

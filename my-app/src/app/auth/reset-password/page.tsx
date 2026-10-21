
'use client'

import { authApi } from "@/lib/api/auth/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { newPasswordSchema } from "@/lib/schemas/auth/password.recovery.schema"

import styles from "./reset-password.module.css"

type ResetPasswordForm = {
    password: string
    password2: string
    token: string
}

const ResetPasswordPage = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [valid, setValid] = useState(false)

    const [errorServer, setErrorServer] = useState<{
        status: number
        message: string
    }>()

    const [message, setMessage] = useState<string>()

    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: "",
            password2: "",
            token: token ?? ""
        }
    })

    useEffect(() => {
        setValue("token", token ?? "")

        const verifyToken = async () => {
            setLoading(true)
            setErrorServer(undefined)
            setValid(false)

            try {
                if (!token) {
                    setErrorServer({
                        status: 400,
                        message: "Falta el token de recuperación."
                    })
                    return
                }

                const res = await authApi.checkToken(token)

                if (!res.ok) {
                    setErrorServer({
                        status: res.status,
                        message: res.error
                    })
                    return
                }

                setValid(true)
            } catch {
                setErrorServer({
                    status: 0,
                    message: "No se pudo conectar con el servidor. Intentá nuevamente."
                })
            } finally {
                setLoading(false)
            }
        }

        verifyToken()
    }, [token, setValue])

    const handlePasswordRecovery = async (data: ResetPasswordForm) => {
        try {
            setSending(true)
            setErrorServer(undefined)

            const res = await authApi.resetPassword(data)

            if (!res.ok) {
                setErrorServer({
                    status: res.status,
                    message: res.error
                })
                return
            }

            setMessage("Tu contraseña se cambió correctamente. Ya podés iniciar sesión.")
        } catch {
            setErrorServer({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <main className={styles.resetPage}>
                <section className={styles.resetCard} aria-live="polite">
                    <div className={`${styles.resetIcon} ${styles.loadingIcon}`} />
                    <h1 className={styles.resetTitle}>Verificando enlace</h1>
                    <p className={styles.resetMessage}>
                        Estamos comprobando tu enlace de recuperación. Un momento, por favor.
                    </p>
                </section>
            </main>
        )
    }

    if (message) {
        return (
            <main className={styles.resetPage}>
                <section className={styles.resetCard} aria-live="polite">
                    <div className={`${styles.resetIcon} ${styles.successIcon}`} aria-hidden="true">
                        ✓
                    </div>
                    <h1 className={styles.resetTitle}>¡Contraseña actualizada!</h1>
                    <p className={styles.resetMessage}>{message}</p>
                    <button
                        className={styles.resetButton}
                        type="button"
                        onClick={() => router.push("/auth/login")}
                    >
                        Ir al login
                    </button>
                </section>
            </main>
        )
    }

    if (!valid || errorServer) {
        return (
            <main className={styles.resetPage}>
                <section className={styles.resetCard} aria-live="polite">
                    <div className={`${styles.resetIcon} ${styles.errorIcon}`} aria-hidden="true">
                        !
                    </div>
                    <h1 className={styles.resetTitle}>No pudimos recuperar tu contraseña</h1>
                    <p className={styles.resetMessage}>
                        {errorServer?.message ?? "El enlace de recuperación no es válido."}
                    </p>
                    <button
                        className={styles.resetButton}
                        type="button"
                        onClick={() => router.push("/auth/login")}
                    >
                        Ir al login
                    </button>
                </section>
            </main>
        )
    }

    return (
        <main className={styles.resetPage}>
            <section className={styles.resetCard}>
                <h1 className={styles.resetTitle}>Restablecer contraseña</h1>
                <p className={styles.resetMessage}>
                    Ingresá tu nueva contraseña para recuperar el acceso a tu cuenta.
                </p>

                <form
                    className={styles.resetForm}
                    onSubmit={handleSubmit(handlePasswordRecovery)}
                >
                    <input type="hidden" {...register("token")} />

                    <div className={styles.resetField}>
                        <div className={styles.resetPasswordWrapper}>
                            <input
                                className={styles.resetInput}
                                type={showPassword ? "text" : "password"}
                                placeholder="Nueva contraseña"
                                autoComplete="new-password"
                                {...register("password")}
                            />

                            <button
                                className={styles.resetTogglePassword}
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? "Ocultar" : "Ver"}
                            </button>
                        </div>

                        {errors.password && (
                            <span className={styles.resetFieldError}>
                                {String(errors.password.message)}
                            </span>
                        )}
                    </div>

                    <div className={styles.resetField}>
                        <div className={styles.resetPasswordWrapper}>
                            <input
                                className={styles.resetInput}
                                type={showPassword2 ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                autoComplete="new-password"
                                {...register("password2")}
                            />

                            <button
                                className={styles.resetTogglePassword}
                                type="button"
                                onClick={() => setShowPassword2(prev => !prev)}
                                aria-label={showPassword2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword2 ? "Ocultar" : "Ver"}
                            </button>
                        </div>

                        {errors.password2 && (
                            <span className={styles.resetFieldError}>
                                {String(errors.password2.message)}
                            </span>
                        )}
                    </div>

                    {errorServer && (
                        <p className={styles.resetServerError} role="alert">
                            {errorServer.message}
                        </p>
                    )}

                    <button
                        className={styles.resetButton}
                        type="submit"
                        disabled={sending}
                    >
                        {sending ? "Enviando..." : "Cambiar contraseña"}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default ResetPasswordPage
'use client'

import { authApi } from "@/lib/api/auth/auth"
import { passwordRecoverySchema } from "@/lib/schemas/auth/password.recovery.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import styles from "./forgot-password.module.css"

const ForgotPasswordPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(passwordRecoverySchema)
    })
    const [serverError, setServerError] = useState<{ status: number, message: string }>()
    const [message, setMessage] = useState<{ status: number, msg: string }>()
    const [loading, setLoading] = useState<boolean>(false)

    const handlePasswordRequest = async (data: { email: string }) => {
        try {
            setLoading(true)
            const res = await authApi.forgotPassword(data)
            if (!res.ok) {
                setServerError({ status: res.status, message: res.error })
                setTimeout(() => {
                    setServerError({ status: 0, message: '' })
                }, 10000);
                return
            }
            setMessage({
                status: res.status,
                msg: "Si el email ingresado corresponde a una cuenta registrada, recibirás instrucciones para recuperar tu contraseña."
            })

        } catch (error) {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            setLoading(false)
            reset()
        }

    }


    return (
        <main className={styles.forgotPage}>
            <section className={styles.forgotPresentation}>
                <p>
                    ¿Olvidaste tu contraseña? No te preocupes,
                    solicitá una nueva y recibirás un email
                    con las instrucciones para recuperarla.
                </p>
            </section>

            <section className={styles.forgotForm}>
                {serverError?.message ? (
                    <p className={styles.forgotServerError} role="alert">
                        {serverError.message}
                    </p>
                ) : message?.msg ? (
                    <p className={styles.forgotSuccess} role="status">
                        {message.msg}
                    </p>
                ) : null}

                <form onSubmit={handleSubmit(handlePasswordRequest)}>
                    <div className={styles.forgotInputGroup}>
                        <input
                            type="text"
                            {...register("email")}
                            placeholder="Ingrese su email..."
                            className={styles.forgotInput}
                            aria-invalid={!!errors.email}
                            aria-describedby={
                                errors.email ? "email-error" : undefined
                            }
                            disabled={loading}
                        />

                        {errors.email && (
                            <span
                                id="email-error"
                                className={styles.forgotInputError}
                            >
                                {String(errors.email.message)}
                            </span>
                        )}
                    </div>

                    <div className={styles.forgotActions}>
                        <button
                            type="submit"
                            className={styles.forgotButton}
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : "Enviar"}
                        </button>

                        <Link
                            href="/auth/login"
                            className={styles.forgotButton}
                        >
                            Volver
                        </Link>
                    </div>
                </form>
            </section>
        </main>
    )
}

export default ForgotPasswordPage
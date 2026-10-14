'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { usersApi } from "@/lib/api/users/users"
import styles from "./confirm.module.css"

const ConfirmAccountPage = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()

    const [error, setError] = useState<{
        status: number
        errorMessage: string
    }>()
    const [message, setMessage] = useState<{
        status: number
        msg: string
    }>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getTokenConfirm = async (token: string | null) => {
            try {
                if (!token) {
                    setError({
                        status: 400,
                        errorMessage: "Falta el token de activación."
                    })
                    return
                }

                const res = await usersApi.ConfirmAccount(token)

                if (!res.ok) {
                    setError({
                        status: res.status,
                        errorMessage: res.error
                    })
                    return
                }

                setMessage({
                    status: res.status,
                    msg: "¡Cuenta activada correctamente! Ya podés iniciar sesión."
                })
            } catch {
                setError({
                    status: 0,
                    errorMessage: "No se pudo conectar con el servidor. Intentá nuevamente."
                })
            } finally {
                setLoading(false)
            }
        }

        getTokenConfirm(token)
    }, [token])


    if (loading) {
        return (
            <main className={styles.confirmPage}>
                <section className={styles.confirmCard} aria-live="polite">
                    <div className={`${styles.confirmIcon} ${styles.loadingIcon}`} />
                    <h1 className={styles.confirmTitle}>Verificando tu cuenta</h1>
                    <p className={styles.confirmMessage}>
                        Estamos comprobando tu enlace de activación. Un momento, por favor.
                    </p>
                </section>
            </main>
        )
    }

    const success = !error

    return (
        <main className={styles.confirmPage}>
            <section className={styles.confirmCard} aria-live="polite">
                <div
                    className={`${styles.confirmIcon} ${success ? styles.successIcon : styles.errorIcon
                        }`}
                    aria-hidden="true"
                >
                    {success ? "✓" : "!"}
                </div>

                <h1 className={styles.confirmTitle}>
                    {success ? "¡Cuenta activada!" : "No pudimos activar tu cuenta"}
                </h1>

                <p className={styles.confirmMessage}>
                    {success
                        ? message?.msg
                        : error.errorMessage}
                </p>

                <button
                    className={styles.confirmButton}
                    type="button"
                    onClick={() => router.push("/auth/login")}
                >
                    Ir al login
                </button>
            </section>
        </main>
    )
}

export default ConfirmAccountPage
'use client'

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import styles from "./serverError.module.css"

const NotFoundPage = ({ message }: { message: string }) => {
    const router = useRouter()
    const { status } = useSession()

    if (status === "loading") {
        return <p className={styles.loading}>Cargando...</p>
    }

    return (
        <main className={styles.container}>
            <section className={styles.content}>
                <p className={styles.message}>{message}</p>

                <div className={styles.actions}>
                    <button
                        className={styles.button}
                        onClick={() => router.push("/")}
                    >
                        Volver al inicio
                    </button>

                    {status !== "authenticated" && (
                        <button
                            className={styles.button}
                            onClick={() => router.push("/login")}
                        >
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </section>
        </main>
    )
}

export default NotFoundPage

import styles from "./serverError.module.css"

type ServerErrorPageProps = {
    message: string
}

export default function ServerErrorPage({
    message
}: ServerErrorPageProps) {
    return (
        <main className={styles.container}>
            <section className={styles.content}>
                <p className={styles.message}>{message}</p>

                <button
                    className={styles.button}
                    onClick={() => window.location.href = "/"}
                >
                    Volver al inicio
                </button>
            </section>
        </main>
    )
}

'use client'

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

type NFactionDto = {
    action: "job"
}

const NotFoundPage = ({ action }: NFactionDto) => {
    const router = useRouter()
    const { status } = useSession()

    if (status === "loading") {
        return <p>Cargando...</p>
    }

    if (action === "job") {
        return (
            <div>
                <p>Publicación no encontrada</p>

                <button onClick={() => router.push("/")}>
                    Volver al inicio
                </button>

                {status !== "authenticated" && (
                    <button onClick={() => router.push("/login")}>
                        Iniciar sesión
                    </button>
                )}
            </div>
        )
    }

    return null
}

export default NotFoundPage

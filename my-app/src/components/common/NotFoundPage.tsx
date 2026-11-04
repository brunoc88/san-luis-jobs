
'use client'

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"



const NotFoundPage = ({message}:{message:string}) => {
    const router = useRouter()
    const { status } = useSession()

    if (status === "loading") {
        return <p>Cargando...</p>
    }

   
        return (
            <div>
                <p>{message}</p>

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



export default NotFoundPage

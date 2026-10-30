'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
    const { status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/")
        }
    }, [status, router])

    if (status === "loading" || status === "authenticated") {
        return <p>Cargando...</p>
    }

    return children
}

export default GuestOnly
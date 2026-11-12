'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface GuestOnlyProps {
    children: React.ReactNode
    redirectTo?: string
}

const GuestOnly = ({ children, redirectTo = "/" }: GuestOnlyProps) => {
    const { status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated") {
            router.replace(redirectTo)
        }
    }, [status, router, redirectTo])

    if (status === "loading" || status === "authenticated") {
        return <p>Cargando...</p>
    }

    return children
}

export default GuestOnly
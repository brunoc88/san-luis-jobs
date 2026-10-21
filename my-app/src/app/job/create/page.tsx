'use client'

import { useSession } from "next-auth/react"

const CreateJobPage = () => {

    const { data: session, status } = useSession()

    if (status === "loading") {
        return <p>Verificando sesión...</p>
    }

    if (!session) {
        return <p>Tenés que iniciar sesión para crear un empleo.</p>
    }

    return <p>Bienvenido, {session.user?.name}</p>
    
    
}

export default CreateJobPage
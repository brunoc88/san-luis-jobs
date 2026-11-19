'use client'

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import AdminOnly from "@/components/auth/AdminOnly"
import Description from "@/components/auth/admin/Description"
import ServerErrorPage from "@/components/common/ServerErrorPage"

const ComplaintInfoPage = () => {
    const { data, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [])
    const { id } = useParams()
    const complaintId = Number(id)

    if (!Number.isInteger(complaintId)) {
        return <ServerErrorPage message= {"ID Invalido"}/>
    }

    if (status === 'loading') return <p>Cargando...</p>
    return (
        <AdminOnly>
            <Description
                id={complaintId}
            />
        </AdminOnly>
    )
}

export default ComplaintInfoPage
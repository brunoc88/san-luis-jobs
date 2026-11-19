'use client'

import AdminPanel from "@/components/auth/admin/AdminList"
import AdminOnly from "@/components/auth/AdminOnly"
import { complaintsApi } from "@/lib/api/complaints/complaints"
import { Complaints } from "@/types/complaint/complaint.types"
import { useEffect, useState } from "react"
import styles from './ComplaintListPage.module.css'
import ServerErrorPage from "@/components/common/ServerErrorPage"

const ComplaintListPage = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [complaints, setComplaints] = useState<Complaints[]>([])
    const [empty, setEmpty] = useState<boolean>(true)
    const [hasNextPage, setHasNextPage] = useState<boolean>(false)
    const [serverError, setServerError] = useState<{ status: number, message: string }>()

    useEffect(() => {
        const loadComplaints = async () => {
            try {
                const res = await complaintsApi.getAllActiveComplaints()
                if (res.ok) {
                    setEmpty(res.data.complaints.length === 0)
                    setComplaints(res.data.complaints)
                    setHasNextPage(res.data.hasNextPage)
                    return
                }
                else {
                    setServerError({status:res.status, message:res.error})
                }
            } catch (error) {
                setServerError({
                    status: 0,
                    message: "No se pudo conectar con el servidor. Intentá nuevamente."
                })
            } finally {
                setLoading(false)
            }
        }
        loadComplaints()
    }, [])

    if(serverError) return <ServerErrorPage message={serverError.message}/>
    return (
        <AdminOnly >
            <div>
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <div>
                        <h1 className={styles.title}>Lista de quejas</h1>
                        <div>
                            {empty ? (
                                <p>No hay quejas disponibles</p>
                            ) : (
                                <AdminPanel
                                    mode="complaints"
                                    dataDB={complaints}
                                    hasNextPage={hasNextPage}
                                    setComplaints={setComplaints}
                                    setHasNextPage={setHasNextPage}
                                    setServerError={setServerError}
                                />
                            )}
                        </div>
                    </div>
                )}

            </div>
        </AdminOnly>

    )
}

export default ComplaintListPage
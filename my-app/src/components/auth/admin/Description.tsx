import NotFoundPage from "@/components/common/NotFoundPage"
import ServerErrorPage from "@/components/common/ServerErrorPage"
import { complaintsApi } from "@/lib/api/complaints/complaints"
import { ComplaintInfo } from "@/types/complaint/complaint.types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import RelativeDate from "@/components/common/RelativeDate"
import styles from './Description.module.css'

type DescriptonProps = {
    id: number
}
const reason: any = {
    FALSE_INFORMATION: 'Información Falsa',
    SUSPECTED_SCAM: 'Posible Estafa',
    INCORRECT_INFORMATION: 'Información Incorrecta',
    INAPPROPRIATE_CONTENT: 'Contenido Inapropiado',
    DUPLICATE_OR_SPAM: 'Duplicado o Spam',
    IMPERSONATION: 'Suplantación de Identidad',
    OTHER: 'Otro'
}

const Description = ({ id }: DescriptonProps) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [serverError, setServerError] = useState<{ status: number, message: string }>()
    const [data, setData] = useState<ComplaintInfo>()
    const router = useRouter()

    useEffect(() => {
        const loadComplaintInfo = async () => {
            try {
                const res = await complaintsApi.getComplaintById(id)
                if (res.ok) {
                    setData(res.data.complaint)
                    return
                }
                setServerError({ status: res.status, message: res.error })
                return
            } catch (error) {
                setServerError({
                    status: 0,
                    message: "No se pudo conectar con el servidor. Intentá nuevamente."
                })
            } finally {
                setLoading(false)
            }
        }

        loadComplaintInfo()

    }, [])

    const deteleComplaint = async () => {
        try {
            const confirmed = window.confirm(
                '¿Seguro que desea eliminar esta denuncia?'
            )

            if (!confirmed) return

            const res = await complaintsApi.delete(id)
            if (res.ok) {
                router.push('/admin/complaints')
                return
            }
            setServerError({ status: res.status, message: res.error })
            return
        } catch (error) {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        }
    }
    if (serverError && serverError?.status === 404) return <NotFoundPage message={serverError.message} />
    if (serverError && serverError.status !== 404) return <ServerErrorPage message={serverError.message} />
    if (loading) <p>Cargando...</p>

    if (!data) return <p>No se pudo cargar la denuncia.</p>

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Denuncia N° {id}</h1>

            <div className={styles.date}>
                Hace <RelativeDate date={data.date} />
            </div>

            <section className={styles.card}>
                <div className={styles.field}>
                    <span>De:</span>
                    <p>{data?.reportedBy}</p>
                </div>

                <div className={styles.field}>
                    <span>Postulación:</span>
                    <Link href={`/jobs/${data?.jobId}`}>
                        {data?.jobReported}
                    </Link>
                </div>

                <div className={styles.field}>
                    <span>Motivo:</span>
                    <p>{data?.reason ? reason[data.reason] : ''}</p>
                </div>

                <div className={styles.explanation}>
                    <span>Especificación:</span>
                    <p>{data?.explanation || 'Sin especificación'}</p>
                </div>
            </section>

            <div className={styles.actions}>
                <button onClick={deteleComplaint}>Eliminar</button>
                <button onClick={() => router.push('/admin/complaints')}>
                    Volver
                </button>
            </div>
        </div>
    )
}

export default Description
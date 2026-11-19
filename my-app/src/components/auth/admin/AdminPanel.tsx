import styles from './AdminPanel.module.css'
import { complaintsApi } from "@/lib/api/complaints/complaints"
import { Complaints } from "@/types/complaint/complaint.types"
import { Dispatch, SetStateAction, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'


type AdminPanelProps = {
  mode: 'complaints' | 'feedback' | 'locations'
  dataDB: Complaints[]
  hasNextPage: boolean
  setComplaints: Dispatch<SetStateAction<Complaints[]>>
  setHasNextPage: Dispatch<SetStateAction<boolean>>
  setServerError: Dispatch<SetStateAction<{ status: number, message: string } | undefined>>
}

type Action = 'more' | 'less'

const reason = {
  FALSE_INFORMATION: 'Información Falsa',
  SUSPECTED_SCAM: 'Posible Estafa',
  INCORRECT_INFORMATION: 'Información Incorrecta',
  INAPPROPRIATE_CONTENT: 'Contenido Inapropiado',
  DUPLICATE_OR_SPAM: 'Duplicado o Spam',
  IMPERSONATION: 'Suplantación de Identidad',
  OTHER: 'Otro'
}

const AdminPanel = ({
  mode,
  dataDB,
  hasNextPage,
  setComplaints,
  setHasNextPage,
  setServerError
}: AdminPanelProps) => {
  const [page, setPage] = useState<number>(1)
  const [loadingPage, setLoadingPage] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()
  const { data } = useSession()

  const loadMoreOrLessComplaints = async (action: Action) => {
    const nextPage = action === 'more' ? page + 1 : page - 1

    setLoadingPage(true)

    try {
      const res = await complaintsApi.getAllActiveComplaints(nextPage)

      if (res.ok) {
        setComplaints(res.data.complaints)
        setHasNextPage(res.data.hasNextPage)
        setPage(nextPage)
      }
    } catch (error) {
      setServerError({
        status: 0,
        message: "No se pudo conectar con el servidor. Intentá nuevamente."
      })
    } finally {
      setLoadingPage(false)
    }
  }

  const deleteComplaint = async (id: number) => {
    setDeleteError(null)

    try {
      const confirmed = window.confirm(
        '¿Seguro que desea eliminar esta denuncia?'
      )

      if (!confirmed) return

      const res = await complaintsApi.delete(id)

      if (res.ok) {
        await reloadComplaints(page)
        return
      }

      if (res.status === 403 && data?.user.role === 'admin') {
        setServerError({ status: res.status, message: res.error })
        return
      }

      setDeleteError(res.error)
    } catch (error) {
      setServerError({
        status: 0,
        message: 'No se pudo conectar con el servidor. Intentá nuevamente.'
      })
    }
  }

  const reloadComplaints = async (currentPage: number) => {
    const res = await complaintsApi.getAllActiveComplaints(currentPage)

    if (!res.ok) return

    if (res.data.complaints.length === 0 && currentPage > 1) {
      await reloadComplaints(currentPage - 1)
      return
    }

    setComplaints(res.data.complaints)
    setHasNextPage(res.data.hasNextPage)
    setPage(currentPage)
  }

  if(mode && mode ==='complaints')return (
    <div>
      <div className={styles.container}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Motivo</th>
              <th>Usuario</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {dataDB.map(d => (
              <tr key={d.id}>
                <td>
                  {new Date(d.date).toLocaleDateString('es-AR')}
                </td>
                <td>{reason[d.reason]}</td>
                <td>{d.user}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => deleteComplaint(d.id)}
                      className={styles.deleteButton}>Eliminar</button>
                    <button
                      onClick={() => router.push(`/admin/complaints/${d.id}`)}
                      className={styles.viewButton}>Ver</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          {page > 1 && (
            <button
              onClick={() => loadMoreOrLessComplaints('less')}
              disabled={loadingPage}
            >
              Anterior
            </button>
          )}

          {hasNextPage && (
            <button
              onClick={() => loadMoreOrLessComplaints('more')}
              disabled={loadingPage}
            >
              Siguiente
            </button>
          )}

          {loadingPage && <span>Cargando...</span>}
        </div>
      </div>
      {deleteError && (
        <p className={styles.error}>
          {deleteError}
        </p>
      )}
    </div>

  )

  if(mode && mode === 'locations') return (
    <div>
      Listado de locaciones
    </div>
  )
}

export default AdminPanel
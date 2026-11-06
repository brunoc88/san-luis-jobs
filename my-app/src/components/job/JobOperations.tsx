'use client'

import { JobState, UserRole } from "@prisma/client"
import styles from "./JobOperations.module.css"
import { JobDetailsDto } from "@/types/job/job.type"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { Dispatch, SetStateAction } from "react"

type ServerError = {
    status: number
    message: string
}

type JobOperationsDto = {
    role: UserRole | undefined
    owner: boolean
    jobState: JobState
    isAuth: boolean,
    setJob: Dispatch<SetStateAction<JobDetailsDto | undefined>>
    jobId: number
    setServerError: Dispatch<SetStateAction<ServerError | undefined>>
    setActionError: Dispatch<SetStateAction<string | undefined>>
}

const JobOperations = ({ owner, isAuth, role, jobState, jobId, setJob, setServerError, setActionError }: JobOperationsDto) => {

    const handleChangeJobStatus = async (status: JobState) => {
        let res: any
        setActionError(undefined)
        try {
            switch (status) {
                case JobState.finished: {
                    const confirmed = window.confirm(
                        "¿Estás seguro de que querés finalizar esta publicación?"
                    )

                    if (!confirmed) return

                    res = await jobsApi.changeJobStatus(jobId, {
                        state: JobState.finished
                    })

                    break
                }

                case JobState.active:
                    res = await jobsApi.changeJobStatus(jobId, {
                        state: JobState.active
                    })
                    break

                case JobState.paused:
                    res = await jobsApi.changeJobStatus(jobId, {
                        state: JobState.paused
                    })
                    break
            }

            // Acá manejás la respuesta de la API.
            if (res.ok) {
                setJob(prev =>
                    prev ? { ...prev, state: status } : prev
                )
                setActionError(undefined)
                return
            } else if (res.status === 400) {
                setActionError(res.error)
                return
            }
            else {
                setServerError({ status: res.status, message: res.error })
                return
            }

        } catch (error) {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        }
    }

    // Usuario no autenticado
    if (!isAuth) return null

    // Usuario propietario
    if (owner) {
        return (
            <div className={styles.menu}>

                {jobState === JobState.active && (
                    <div>
                        <button
                            onClick={() => handleChangeJobStatus('paused')}
                            className={styles.operationButton}>Pausar
                        </button>
                        <button
                            onClick={() => handleChangeJobStatus('finished')}
                            className={styles.operationButton}>Finalizar</button>
                    </div>
                )}

                {jobState === JobState.paused && (
                    <div>
                        <button
                            onClick={() => handleChangeJobStatus('active')}
                            className={styles.operationButton}>Activar</button>
                        <button
                            onClick={() => handleChangeJobStatus('finished')}
                            className={styles.operationButton}>Finalizar</button>
                    </div>
                )}

                {jobState === JobState.finished && (
                    <div>
                        <button
                            onClick={() => handleChangeJobStatus('active')}
                            className={styles.operationButton}>Activar</button>
                        <button
                            onClick={() => handleChangeJobStatus('paused')}
                            className={styles.operationButton}>Pausar</button>
                    </div>
                )}

                <button className={styles.operationButton}>Editar</button>
                <button className={styles.operationButton}>Eliminar</button>

            </div>
        )
    }

    // Usuario autenticado y no propietario
    return (
        <div>
            {(role === 'admin' || role === 'superAdmin') && (
                <div>
                    <button className={styles.operationButton}>Suspender</button>
                </div>
            )}

            <div>
                <button className={styles.operationButton}>Reportar</button>
            </div>
        </div>
    )
}

export default JobOperations
'use client'

import { JobState } from "@prisma/client"
import { useState, Dispatch, SetStateAction } from "react"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { JobDetailsDto } from "@/types/job/job.type"
import styles from "./JobActionsButton.module.css"

type ServerError = {
    status: number
    message: string
}

type JobButtonProps = {
    authenticated: boolean
    jobState: JobState | undefined
    author: string | undefined
    user: string | null | undefined
    alreadyApply: boolean | undefined
    alreadySaved: boolean | undefined
    jobId: number
    setJob: Dispatch<SetStateAction<JobDetailsDto | undefined>>
    setServerError: Dispatch<SetStateAction<ServerError | undefined>>
}

const JobActionsButton = ({
    authenticated,
    jobState,
    author,
    user,
    alreadyApply,
    alreadySaved,
    jobId,
    setJob,
    setServerError
}: JobButtonProps) => {

    const [sending, setSending] = useState<boolean>(false)
    const [saveOk, setSaveOk] = useState<boolean>(false)
    const [applyOk, setApplyOk] = useState<boolean>(false)
    const [action, setAction] = useState<string>()
    const [cvError, setCvError] = useState<string>()

    const handleSavingJob = async (jobId: number) => {
        try {
            setSending(true)
            setAction('saving')

            const res = await jobsApi.saveJob(jobId)

            if (res.ok) {
                setSaveOk(true)
            } else {
                setServerError({ status: res.status, message: res.error })
            }

        } catch {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            await new Promise(resolve => setTimeout(resolve, 2000))
            setSending(false)
            setAction('')
        }
    }

    const handleApplyingJob = async (jobId: number) => {
        try {
            setSending(true)
            setAction('apply')

            const res = await jobsApi.applyJob(jobId)

            if (res.ok) {
                setApplyOk(true)
                setJob(prev =>
                    prev ? { ...prev, alreadyApplied: true } : prev
                )
            } else if (res.status === 400) {
                setCvError(res.error)

            } else {
                setServerError({ status: res.status, message: res.error })
            }

        } catch {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            await new Promise(resolve => setTimeout(resolve, 2000))
            setSending(false)
            setAction('')
        }
    }

    if (!authenticated || author === user) return null

    if (sending && action === 'saving') return <p>Guardando...</p>
    if (sending && action === 'apply') return <p>Enviando...</p>

    if (jobState === JobState.active) {
        return (
            <div className={styles.buttons}>
                {!alreadyApply && !applyOk && (
                    <button
                        onClick={() => handleApplyingJob(jobId)}
                        className={styles.button}
                        disabled={sending}
                    >
                        Postularse
                    </button>
                )}

                {!alreadySaved && !saveOk && (
                    <button
                        onClick={() => handleSavingJob(jobId)}
                        className={styles.button}
                        disabled={sending}
                    >
                        Guardar
                    </button>
                )}
                {cvError && (
                    <p className={styles.error}>
                        {cvError}
                    </p>
                )}
                
            </div>
        )
    }

    if (jobState === JobState.paused) {
        return (
            <div>
                {!alreadySaved && !saveOk && (
                    <button
                        onClick={() => handleSavingJob(jobId)}
                        className={styles.button}
                        disabled={sending}
                    >
                        Guardar
                    </button>
                )}
            </div>
        )
    }

    
    return null
}

export default JobActionsButton
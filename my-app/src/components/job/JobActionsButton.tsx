import { JobState } from "@prisma/client"
import styles from "./JobActionsButton.module.css"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { useState } from "react"

type JobButtonDto = {
    authenticated: boolean
    jobState: JobState | undefined
    author: string | undefined
    user: string | null | undefined
    alreadyApply: boolean | undefined
    alreadySaved: boolean | undefined
    jobId: number
}



const JobActionsButton = ({
    authenticated,
    jobState,
    author,
    user,
    alreadyApply,
    alreadySaved,
    jobId
}: JobButtonDto) => {
    const [sending, setSending] = useState<boolean>(false)
    const [serverError, setServerError] = useState<{ status: number, message: string }>()
    const [saveOk, setSaveOk] = useState<boolean>(false)
    const [applyOk, setApplyOk] = useState<boolean>(false)

    const handleSavingJob = async (jobId: number) => {

        try {
            setSending(true)
            const res = await jobsApi.saveJob(jobId)
            if (res.ok) {
                return setSaveOk(true)
            } else {
                setServerError({ status: res.status, message: res.error })
            }
        } catch (error) {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            setSending(false)
        }

    }

    const handleApplyingJob = async (jobId: number) => {
        try {
            setSending(true)
            const res = await jobsApi.applyJob(jobId)
            if (res.ok) {
                return setApplyOk(true)
            } else {
                setServerError({ status: res.status, message: res.error })
            }
        } catch (error) {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            setSending(false)
        }
    }

    if (!authenticated || (author === user)) return null

    if (sending) return <p>Enviando...</p>

    if (jobState === "active" && !sending) {
        return (
            <div className={styles.buttons}>
                {!alreadyApply && !applyOk && (
                    <button
                        onClick={() => handleApplyingJob(jobId)}
                        className={styles.button}
                    >
                        Postularse
                    </button>
                )}

                {!alreadySaved && !saveOk && (
                    <button
                        onClick={() => handleSavingJob(jobId)}
                        className={styles.button}
                    >
                        Guardar
                    </button>
                )}

                {serverError?.message && (
                    <div className={styles.error}>
                        {serverError.message}
                    </div>
                )}
            </div>
        )
    }

    if (jobState === "paused") {
        return (
            <div>
                {!alreadySaved && !saveOk ? (
                    <button
                        onClick={() => { handleSavingJob(jobId) }}
                        className={styles.button}>Guardar</button>
                ) : ('')}
            </div>
        )
    }

    return null
}

export default JobActionsButton

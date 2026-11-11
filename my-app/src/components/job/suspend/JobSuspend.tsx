import { Dispatch, SetStateAction, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { SuspensionReasonSchema } from "@/lib/schemas/warning/warnigSchema"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { useRouter } from "next/navigation"
import styles from "./JobSuspend.module.css"

export type SuspensionReasonDto = z.infer<
    typeof SuspensionReasonSchema
>

type JobSuspendProps = {
    jobId: number
    author: string
    title: string
    setHide2: Dispatch<SetStateAction<boolean>>
    setServerError: Dispatch<
        SetStateAction<{ status: number, message: string } | undefined>
    >
}

const JobSuspend = ({
    jobId,
    author,
    title,
    setHide2,
    setServerError
}: JobSuspendProps) => {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SuspensionReasonDto>({
        resolver: zodResolver(SuspensionReasonSchema),
        defaultValues: {},
        shouldUnregister: true
    })

    const [message, setMessage] = useState<string>("")
    const router = useRouter()

    const handleSuspendJob = async (data: SuspensionReasonDto) => {
        try {
            const confirm = window.confirm("¿Suspender esta publicación?")

            if (confirm) {
                const res = await jobsApi.suspendJob(jobId, data)

                if (res.ok) {
                    setMessage("¡Suspensión realizada!")
                    await new Promise(resolve => setTimeout(resolve, 1800))
                    router.push("/")
                } else {
                    setServerError({
                        status: res.status,
                        message: res.error
                    })
                }
            }
        } catch {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        }
    }

    if (message) {
        return (
            <div className={styles.success}>
                <p>{message}</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.topBar} />

            <div className={styles.header}>
                <p>Suspensión de publicación</p>
            </div>

            <div className={styles.jobInfo}>
                <p className={styles.description}>
                    Está a punto de suspender la publicación de:
                </p>

                <p className={styles.author}>{author}</p>
                <p className={styles.title}>{title}</p>
            </div>

            <form
                className={styles.form}
                onSubmit={handleSubmit(handleSuspendJob)}
            >
                <div className={styles.reasonContainer}>
                    <label htmlFor="reason">Motivo de suspensión</label>

                    <textarea
                        id="reason"
                        placeholder="Ingrese el motivo de suspensión."
                        {...register("reason")}
                    />

                    {errors.reason?.message && (
                        <span className={styles.error}>
                            {errors.reason.message}
                        </span>
                    )}
                </div>

                <div className={styles.buttons}>
                    <button type="submit" className={styles.submitButton}>
                        Suspender publicación
                    </button>

                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() => setHide2(false)}
                    >
                        Volver
                    </button>
                </div>
            </form>
        </div>
    )
}

export default JobSuspend
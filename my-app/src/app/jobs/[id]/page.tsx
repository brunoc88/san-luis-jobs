'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { JobDetailsDto } from "@/types/job/job.type"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { useSession } from "next-auth/react"
import JobActionsButton from "@/components/job/JobActionsButton"
import RelativeDate from "@/components/common/RelativeDate"
import NotFoundPage from "@/components/common/NotFoundPage"
import JobOperations from "@/components/job/JobOperations"
import styles from "./JobInfoPage.module.css"
import { UserRole } from "@prisma/client"
import ServerErrorPage from "@/components/common/ServerErrorPage"

const JobInfoPage = () => {

    const { id } = useParams()
    const { status, data } = useSession()
    const [job, setJob] = useState<JobDetailsDto>()
    const [loading, setLoading] = useState<boolean>(true)
    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const [serverError, setServerError] = useState<{ status: number, message: string }>()
    const [role, setRole] = useState<UserRole>()
    const [isAuth, setIsAuth] = useState<boolean>(false)
    const [actionError, setActionError] = useState<string>()
    const jobId = Number(id)

    const modalityLabels = {
        remote: "Remoto",
        hybrid: "Híbrido",
        onSite: "Presencial"
    } as const

    const scheduleLabels = {
        partTime: "Media jornada",
        fullTime: "Jornada completa"
    } as const

    const jobState = {
        active: "Activa",
        paused: "Pausada",
        finished: "Finalizada"
    }

    useEffect(() => {
        if (status === 'authenticated') {
            setAuthenticated(true)
            setRole(data?.user?.role)
            setIsAuth(true)
        }
        const loadJobInfo = async () => {
            try {
                const res = await jobsApi.jobInfo(jobId)

                if (res.ok) {
                    setJob(res.data.job)
                    return
                } else {
                    setServerError({ status: res.status, message: res.error })
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
        loadJobInfo()
    }, [status])


    if (loading || status === 'loading') return <p>Cargando...</p>
    if (serverError?.status === 404) {
        return <NotFoundPage message={serverError.message} />
    }
    if (serverError &&
        (
            serverError.status === 401 ||
            serverError.status === 403 ||
            serverError.status === 429
        )
    ) {
        return (
            <ServerErrorPage message={serverError.message} />
        )
    }


    if (job) return (
        <main className={styles.page}>
            <section className={styles.jobCard}>

                <div className={styles.topSection}>
                    <div className={styles.author}>
                        {job.author.pic ? (
                            <img
                                className={styles.avatar}
                                src={job.author.pic}
                                alt="Foto de perfil"
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder} />
                        )}

                        <span>{job.author.username}</span>
                    </div>
                </div>

                {/* Título y operaciones */}
                <div className={styles.titleRow}>
                    <h1 className={styles.jobTitle}>{job.title}</h1>

                    <div className={styles.operations}>
                        <JobOperations
                            owner={job.owner}
                            jobState={job.state}
                            role={role}
                            isAuth={isAuth}
                            jobId={jobId}
                            setJob={setJob}
                            setServerError={setServerError}
                            setActionError={setActionError}
                        />
                    </div>
                </div>

                {/* Estado y mensajes */}
                <div className={styles.statusRow}>
                    <span className={`${styles.jobState} ${styles[job.state]}`}>
                        <span className={styles.statusDot} />
                        {jobState[job.state]}
                    </span>

                    {!job.owner && job.alreadyApplied ? (
                        <span className={styles.infoMessage}>
                            Ya estás postulado
                        </span>
                    ) : job.applicationLimit ? (
                        <span className={styles.infoMessage}>
                            Disponible: {job.numberOfApplicants}/{job.applicationLimit}
                        </span>
                    ) : null}
                </div>

                {/* Información secundaria */}
                <div className={styles.jobMetadata}>
                    <p>Hace <RelativeDate date={job.date} /></p>
                    <p>{job.location.name}, San Luis</p>
                    <p>{scheduleLabels[job.schedule]}</p>
                    <p>{modalityLabels[job.modality]}</p>

                    {job.salary && <p>${job.salary}</p>}
                </div>

                {/* Descripción */}
                <section className={styles.descriptionSection}>
                    <h2>Descripción</h2>
                    <p>{job.description}</p>
                </section>

                {/* Botones Postular/Guardar*/}
                <div className={styles.actionButtons}>
                    <JobActionsButton
                        authenticated={authenticated}
                        jobState={job.state}
                        author={job.author.username}
                        user={data?.user.name}
                        alreadyApply={job.alreadyApplied}
                        alreadySaved={job.alreadySaved}
                        jobId={job.id}
                        setJob={setJob}
                        setServerError={setServerError}

                    />

                    {actionError && (
                        <p className={styles.errorActions}>
                            {actionError}
                        </p>
                    )}
                </div>

            </section>
        </main>
    )

    return <p>No se pudo cargar la publicación.</p>
}

export default JobInfoPage
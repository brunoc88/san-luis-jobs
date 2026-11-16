'use client'

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import JobInputs from "@/components/job/jobInputs"
import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { locationApi } from "@/lib/api/location/location"
import { Locations } from "@/types/location/location.types"
import { CreateJobPayload, jobOptions } from "@/types/job/job.type"

import styles from "../../create/createJob.module.css"
import NotFoundPage from "@/components/common/NotFoundPage"
import ServerErrorPage from "@/components/common/ServerErrorPage"

type JobFormInput = z.input<typeof JobRegisterSchema>
type JobFormOutput = z.output<typeof JobRegisterSchema>

const JobEditFormPage = () => {
    const { data, status } = useSession()
    const router = useRouter()
    const { id } = useParams()
    const jobId = Number(id)

    const [loadingJob, setLoadingJob] = useState(true)
    const [loadingLocations, setLoadingLocations] = useState(true)
    const [sending, setSending] = useState(false)
    const [locations, setLocations] = useState<Locations>()
    const [serverError, setServerError] = useState<{
        status: number
        message: string
    }>()

    const [jobOptions, setJobOptions] = useState<jobOptions>({
        salary: false,
        applicationLimit: false
    })

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<JobFormInput, unknown, JobFormOutput>({
        resolver: zodResolver(JobRegisterSchema)
    })
    const [submitError, setSubmitError] = useState<string>()

    // Carga de job
    const loadedRef = useRef(false)
    useEffect(() => {

        if (status === "unauthenticated") {
            router.push("/auth/login")
            return
        }

        if (status !== "authenticated") return
        if (loadedRef.current) return
        loadedRef.current = true

        const loadJob = async () => {
            try {
                setLoadingJob(true)

                const res = await jobsApi.jobInfo(jobId)

                if (!res.ok) {
                    setServerError({ status: res.status, message: res.error })
                    return
                }

                const job = res.data.job
                const userId = Number(data.user.id)
                if (userId !== job.author.id) {
                    setServerError({ status: 404, message: 'Recurso no encontrado' })
                    return
                }
                reset({
                    title: job.title,
                    locationId: job.location.id,
                    modality: job.modality,
                    schedule: job.schedule,
                    salary: job.salary ?? undefined,
                    applicationLimit: job.applicationLimit ?? undefined,
                    description: job.description
                })
                setJobOptions({
                    salary: job.salary != null,
                    applicationLimit: job.applicationLimit != null
                })
            } catch {
                setServerError({
                    status: 0,
                    message: "No se pudo conectar con el servidor. Intentá nuevamente."
                })
            } finally {
                setLoadingJob(false)
            }
        }

        loadJob()
    }, [status, jobId, router, reset])

    // Carga de localidades
    useEffect(() => {
        if (status !== "authenticated") return

        const loadLocations = async () => {
            try {
                setLoadingLocations(true)

                const res = await locationApi.getActiveLocation()

                if (res.ok) {
                    setLocations(res.data.locations)
                }
                if (res.data.locations.length === 0) {
                    setServerError({
                        status: 404,
                        message: "No hay localidades activas disponibles."
                    })
                }


            } catch {
                setServerError({
                    status: 0,
                    message: "No se pudo conectar con el servidor. Intentá nuevamente."
                })
            } finally {
                setLoadingLocations(false)
            }
        }

        loadLocations()
    }, [status])

    const handleEditJob = async (data: CreateJobPayload) => {
        try {

            setServerError(undefined)
            setSending(true)


            const res = await jobsApi.editJob(jobId, data)

            if (!res.ok) {
                if (res.status === 400) {
                    setSubmitError(res.error)
                    return
                }
                setServerError({ status: res.status, message: res.error })
                return
            }
            else {
                router.push(`/jobs/${jobId}`)
                return
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

    if (status === "loading" || status === "unauthenticated") {
        return (
            <main className={styles.statusPage}>
                <p>Verificando sesión...</p>
            </main>
        )
    }

    if (loadingJob || loadingLocations) {
        return (
            <main className={styles.statusPage}>
                <p>Cargando empleo...</p>
            </main>
        )
    }

    if (serverError?.status === 404) return (
        <NotFoundPage message={serverError.message} />
    )

    if (serverError && (serverError.status !== 404 && serverError.status !== 400)) {
        return (
            <ServerErrorPage message={serverError.message} />
        )
    }
    if (locations?.length === 0) {
        return (
            <main className={styles.statusPage}>
                <section className={styles.statusCard}>
                    <p className={styles.statusText}>
                        No hay localidades disponibles para editar un trabajo.
                    </p>
                </section>
            </main>
        )
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                {serverError?.message && (
                    <p className={styles.serverError} role="alert">
                        {serverError.message}
                    </p>
                )}

                {submitError && (
                    <p className={styles.serverError} role="alert">
                        {submitError}
                    </p>
                )}
                <h1 className={styles.title}>Edición de empleo</h1>

                <form onSubmit={handleSubmit(handleEditJob, (errs) => console.log("INVALID", errs))}>
                    {locations && (
                        <JobInputs
                            register={register}
                            reset={reset}
                            errors={errors}
                            locations={locations}
                            jobOptions={jobOptions}
                            setJobOptions={setJobOptions}
                            sending={sending}
                            editMode={true}
                            jobId={jobId}
                            setValue={setValue}
                        />
                    )}
                </form>
            </section>
        </main>
    )
}

export default JobEditFormPage
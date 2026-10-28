
'use client'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import JobInputs from "@/components/job/jobInputs"
import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { Locations } from "@/types/location/location.types"
import { locationApi } from "@/lib/api/location/location"
import { CreateJobPayload, jobOptions } from "@/types/job/job.type"
import { jobsApi } from "@/lib/api/jobs/jobs"

import styles from "./createJob.module.css"

type JobFormInput = z.input<typeof JobRegisterSchema>
type JobFormOutput = z.output<typeof JobRegisterSchema>

const CreateJobFormPage = () => {
  const { status } = useSession()
  const router = useRouter()

  const [serverError, setServerError] = useState<{
    status: number
    message: string
  }>()

  const [locations, setLocations] = useState<Locations>()
  const [loading, setLoading] = useState(false)

  const [jobOptions, setJobOptions] = useState<jobOptions>({
    salary: false,
    applicationLimit: false
  })

  const [sending, setSending] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [inactiveAccount, setInactiveAccount] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<JobFormInput, unknown, JobFormOutput>({
    resolver: zodResolver(JobRegisterSchema)
  })

  useEffect(() => {
    if (status !== "authenticated") return

    const loadLocations = async () => {
      try {
        setLoading(true)

        const res = await locationApi.getActiveLocation()

        if (res.ok) {
          setLocations(res.data.locations)
        } else {
          setServerError({
            status: res.status,
            message: res.error
          })
        }
      } catch {
        setServerError({
          status: 0,
          message: "No se pudo conectar con el servidor. Intentá nuevamente."
        })
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [status])

  const handleJobCreation = async (data: CreateJobPayload) => {
    try {
      setServerError(undefined)
      setSending(true)

      const res = await jobsApi.create(data)

      if (!res.ok) {
        if (res.status === 401) {
          setUnauthorized(true)
          return
        }

        if (res.status === 403) {
          setInactiveAccount(true)
          return
        }

        setServerError({
          status: res.status,
          message: res.error
        })
        return
      }

      reset()
      setJobOptions({
        salary: false,
        applicationLimit: false
      })
    } catch {
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

  if (loading) {
    return (
      <main className={styles.statusPage}>
        <p>Cargando localidades...</p>
      </main>
    )
  }

  if (locations?.length === 0) {
    return (
      <main className={styles.statusPage}>
        <section className={styles.statusCard}>
          <p className={styles.statusText}>
            No hay localidades disponibles para crear un trabajo.
          </p>
        </section>
      </main>
    )
  }

  if (unauthorized || inactiveAccount) {
    return (
      <main className={styles.statusPage}>
        <section className={styles.statusCard}>
          <p className={styles.statusText}>
            {unauthorized
              ? "Tu sesión expiró. Iniciá sesión nuevamente para continuar."
              : "Tu cuenta no está habilitada para realizar esta acción. Contactá al administrador si creés que se trata de un error."}
          </p>

          <button
            className={styles.statusButton}
            onClick={() => router.push("/auth/login")}
          >
            Ir al login
          </button>
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

        <h1 className={styles.title}>
          Ofrecete y ofrecé trabajo
        </h1>

        <p className={styles.subtitle}>
          Completá los datos para publicar una oportunidad laboral.
        </p>

        <form onSubmit={handleSubmit(handleJobCreation)}>
          {locations && (
            <JobInputs
              register={register}
              reset={reset}
              errors={errors}
              locations={locations}
              jobOptions={jobOptions}
              setJobOptions={setJobOptions}
              sending={sending}
            />
          )}
        </form>
      </section>
    </main>
  )
}

export default CreateJobFormPage

'use client'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import JobInputs from "@/components/job/jobInputs"
import { z } from "zod"
import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { Locations } from "@/types/location/location.types"
import { locationApi } from "@/lib/api/location/location"
import { jobOptions } from "@/types/job/job.type"

type JobFormInput = z.input<typeof JobRegisterSchema>
type JobFormOutput = z.output<typeof JobRegisterSchema>

const CreateJobFormPage = () => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [serverError, setServerError] = useState<{
        status: number
        message: string
    }>()

    const [locations, setLocations] = useState<Locations>()
    const [loading, setLoading] = useState<boolean>(false)
    const [jobOptions, setJobOptions] = useState<jobOptions>({ salary: false, applicationLimit: false })
    const [sending, setSendig] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<JobFormInput, unknown, JobFormOutput>({
        resolver: zodResolver(JobRegisterSchema)
    })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/auth/login")
        }

        const loadLocations = async () => {
            try {
                setLoading(true)
                const res = await locationApi.getActiveLocation()
                if (res.ok) setLocations(res.data.locations)
                else setServerError({ status: res.status, message: res.error })
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
        loadLocations()
    }, [status, router])

    const handleJobCreation = (data: JobFormInput) => {
        console.log(data)

        try {
            //setSendig(true)
        } catch (error) {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            //setSendig(false)
        }
    }

    if (status === "loading" || status === "unauthenticated") {
        return <p>Verificando sesión...</p>
    }

    if (loading) return <p>Cargando locaciones...</p>
    if (locations?.length === 0) return <p>Error: No hay locaciones cargadas!</p>

    return (
        <div>
            <p>
                Ofrecete y ofrece trabajo!
            </p>
            <form onSubmit={handleSubmit(handleJobCreation)}>
                <JobInputs
                    register={register}
                    reset={reset}
                    errors={errors}
                    locations={locations}
                    jobOptions={jobOptions}
                    setJobOptions={setJobOptions}
                    sending={sending}
                />
            </form>
        </div>)
}

export default CreateJobFormPage
'use client'

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { JobDetailsDto } from "@/types/job/job.type"
import { jobsApi } from "@/lib/api/jobs/jobs"

const JobEditFormPage = () => {
    const { status, data } = useSession()
    const router = useRouter()
    const {id} = useParams()
    const jobId = Number(id)
    const [loading, setLoading] = useState<boolean>(true)
    const [job, setJob] = useState<JobDetailsDto>()
    const [serverError, setServerError] = useState<{ status: number, message: string }>()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push("/auth/login")
            return
        }
        const loadJob = async (jobId:number) => {
            try {
                const res = await jobsApi.jobInfo(jobId)
                if(res.ok) {
                    setJob(res.data)
                }
                
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        loadJob(jobId)
    }, [status])

    if(loading) return <p>Cargando...</p>
    return (
        <div>
            <p>Formulario de Edicion de publicacion</p>
        </div>
    )
}
export default JobEditFormPage
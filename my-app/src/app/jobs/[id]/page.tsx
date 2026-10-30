'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { JobDetailsDto } from "@/types/job/job.type"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { useSession } from "next-auth/react"
import JobInfoButton from "@/components/job/jobInfoButtons"
import RelativeDate from "@/components/common/RelativeDate"
import NotFoundPage from "@/components/common/NotFoundPage"
import { error } from "console"

const JobInfoPage = () => {
    const { id } = useParams()
    const { status, data } = useSession()
    const [job, setJob] = useState<JobDetailsDto>()
    const [loading, setLoading] = useState<boolean>(true)
    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const [serverError, setServerError] = useState<{ status: number, message: string }>()
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

    useEffect(() => {
        if (status === 'authenticated') {
            setAuthenticated(true)
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
        return <NotFoundPage action="job" />
    }
    if (job) return (
        <div>
            {/* author info */}
            <div>
                {/*<img src={job?.author.pic} alt="profile" />*/}
                {job.author.username}
            </div>
            {/* Job info */}
            <div>
                <h1>{job.title}</h1>
            </div>
            {/* Job details */}
            <div>
                <p>{job.state}</p>
                <p>Hace <RelativeDate date={job.date} /></p>
                <p>{job.location.name}, SL</p>
                <p>{modalityLabels[job.modality]}</p>
                <p>{scheduleLabels[job.schedule]}</p>
                <>{job.salary &&
                    <p>${job.salary}</p>
                }</>
                <p>{job.description}</p>
            </div>
            {/*extra details*/}
            <div>
                {authenticated && (job.author.username !== data?.user.name) && job.applicationLimit ?
                    (<p>{job.alreadyApplied ? 'Ya estas postulado' : `vacantes: ${job.numberOfApplicants}/${job.applicationLimit}`}</p>) : (null)
                }

            </div>
            <div>
                <JobInfoButton
                    authenticated={authenticated}
                    jobState={job?.state}
                    author={job?.author.username}
                    user={data?.user.name}
                />
            </div>
        </div>
    )

    return <p>No se pudo cargar la publicación.</p>
}

export default JobInfoPage
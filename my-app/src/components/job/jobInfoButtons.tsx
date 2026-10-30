
import { JobState } from "@prisma/client"

type JobButtonDto = {
    authenticated: boolean
    jobState: JobState | undefined
    author: string | undefined
    user : string | null | undefined
}

const JobInfoButton = ({
    authenticated,
    jobState,
    author,
    user
}: JobButtonDto) => {

    if (!authenticated || (author === user)) return null

    if (jobState === "active") {
        return (
            <div>
                <button>Postularse</button>
                <button>Guardar</button>
            </div>
        )
    }

    if (jobState === "paused") {
        return (
            <div>
                <button>Guardar</button>
            </div>
        )
    }

    return null
}

export default JobInfoButton

type JobModality = "remote" | "hybrid" | "onSite"

type JobSchedule = "partTime" | "fullTime"

export type CreateJobDto = {
    title: string,
    description: string,
    salary: number | null,
    applicationLimit:number| null,
    modality: JobModality,
    schedule: JobSchedule
    locationId: number
}

export type CreateJobData = CreateJobDto & {userId:number}
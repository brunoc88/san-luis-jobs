import { JobState } from "@prisma/client"

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

export type SaveJobDto = {
    userId: number,
    jobId: number
}

export type SaveJobData = SaveJobDto

export type BaseJobDto = {
    title: string
    description: string
    salary: number | null
    modality: JobModality
    schedule: JobSchedule
}

export type JobDetailsDto = BaseJobDto & {
    id: number
    author: {
        username: string
        pic: string
    }
    state: JobState
    date: Date
    location: {
        name: string
    }
    alreadyApplied?: boolean
    numberOfApplicants?: number
}
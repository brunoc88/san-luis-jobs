import { JobState } from "@prisma/client"

export type UserInfoDto = {
    username: string
    email?:string
    description?: string | null
    pic:string
    isPublic: boolean
    jobs?:{id:number, title:string, state?:JobState, date: Date}[]
    savedJobs?:{id:number, title:string, state:JobState, date: Date}[]
}
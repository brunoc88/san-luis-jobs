import { ComplaintReason } from "@prisma/client"

export type CreateComplaintData = {
    userId:number,
    jobId:number,
    reason: ComplaintReason,
    explanation?: string | null
}

export type Complaints = CreateComplaintData & {
    user:string
    id:number
    date: Date
}
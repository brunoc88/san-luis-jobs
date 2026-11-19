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

export type ComplaintInfo = {
    id: number
    date: Date
    reportedBy: string
    jobId:number
    jobReported: string
    jobAuthor: string
    reason: string
    explanation:string
}
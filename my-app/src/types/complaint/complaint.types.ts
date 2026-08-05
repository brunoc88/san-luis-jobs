import { ComplaintReason } from "@prisma/client"

export type CreateComplaintData = {
    userId:number,
    jobId:number,
    reason: ComplaintReason,
    explanation?: string | null
}
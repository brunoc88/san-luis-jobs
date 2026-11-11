import handleResponse from "@/lib/handleResponse"
import { CreateJobPayload } from "@/types/job/job.type"
import { JobState } from "@prisma/client"
import { ComplaintRegisterSchema } from "@/lib/schemas/complaint/complaint.create.schema"
import {z} from "zod"
import { SuspensionReasonSchema } from "@/lib/schemas/warning/warnigSchema"

export type ComplaintRegisterDto = z.infer<
    typeof ComplaintRegisterSchema
>
export type SuspensionReasonDto = z.infer<
    typeof SuspensionReasonSchema
>

let url = '/api/jobs'

export const jobsApi = {
    create: async (data: CreateJobPayload) => {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: "include"
        })
        return await handleResponse(res)
    },

    jobInfo: async (id: number) => {
        const res = await fetch(`${url}/${id}`, {
            method: 'GET'
        })
        return await handleResponse(res)
    },

    saveJob: async (id: number) => {
        const res = await fetch(`${url}/${id}/save`, {
            method: 'POST',
            credentials: "include"
        })

        return await handleResponse(res)
    },

    applyJob: async (id: number) => {
        const res = await fetch(`${url}/${id}/apply`, {
            method: 'POST',
            credentials: "include"
        })

        return await handleResponse(res)
    },

    changeJobStatus: async (id: number, data: { state: JobState }) => {
        const res = await fetch(`${url}/${id}/state`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            credentials: "include"
        })

        return await handleResponse(res)
    },

    reportJob: async (id:number, data:ComplaintRegisterDto) => {
        const res = await fetch(`${url}/${id}/complaint`, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: "include"
        })

        return await handleResponse(res)
    },

    suspendJob: async(id:number, data:SuspensionReasonDto) => {
        const res = await fetch(`${url}/${id}/suspend`, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: "include"
        })

        return await handleResponse(res)
    }
}
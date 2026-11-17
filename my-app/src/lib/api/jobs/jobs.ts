import handleResponse from "@/lib/handleResponse"
import { CreateJobPayload } from "@/types/job/job.type"
import { JobState } from "@prisma/client"
import { ComplaintRegisterSchema } from "@/lib/schemas/complaint/complaint.create.schema"
import { z } from "zod"
import { SuspensionReasonSchema } from "@/lib/schemas/warning/warnigSchema"
import { JobQuerySchema } from "@/lib/schemas/job/job.query.schema"

export type ComplaintRegisterDto = z.infer<
    typeof ComplaintRegisterSchema
>
export type SuspensionReasonDto = z.infer<
    typeof SuspensionReasonSchema
>
export type JobFilters = z.input<typeof JobQuerySchema>

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

    reportJob: async (id: number, data: ComplaintRegisterDto) => {
        const res = await fetch(`${url}/${id}/complaint`, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: "include"
        })

        return await handleResponse(res)
    },

    suspendJob: async (id: number, data: SuspensionReasonDto) => {
        const res = await fetch(`${url}/${id}/suspend`, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: "include"
        })

        return await handleResponse(res)
    },

    deleteJob: async (id: number) => {
        const res = await fetch(`${url}/${id}`, {
            method: 'DELETE',
            credentials: "include"
        })

        return await handleResponse(res)
    },

    editJob: async (id: number, data: CreateJobPayload) => {

        const res = await fetch(`${url}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            credentials: "include"
        })

        return await handleResponse(res)
    },

    getJobs: async (filters?: JobFilters) => {
        const params = new URLSearchParams()

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    params.append(key, String(value))
                }
            })
        }

        const res = await fetch(
            `${url}?${params.toString()}`,
            { method: "GET" }
        )

        return await handleResponse(res)
    }
}
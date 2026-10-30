import handleResponse from "@/lib/handleResponse"
import { CreateJobPayload } from "@/types/job/job.type"

let url = '/api/jobs'

export const jobsApi = {
    create: async (data:CreateJobPayload) => {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: "include"
        })
        return await handleResponse(res)
    },

    jobInfo: async (id:number) => {
        const res = await fetch(`${url}/${id}`,{
            method:'GET'
        })
        return await handleResponse(res)
    }
}
import handleResponse from "@/lib/handleResponse"

let url = '/api/location'

export const locationApi = {
    getActiveLocation: async () => {
        const res = await fetch(`${url}/active`, {
            method: 'GET'
        })
        return await handleResponse(res)
    }
}
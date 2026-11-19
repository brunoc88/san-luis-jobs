import handleResponse from "@/lib/handleResponse"

let url = '/api/location'

export const locationApi = {
    getActiveLocation: async () => {
        const res = await fetch(`${url}/active`, {
            method: 'GET'
        })
        return await handleResponse(res)
    },

    getAllLocations: async () => {
        const res = await fetch(url, {
            method: 'GET',
            credentials:'include'
        })
        return await handleResponse(res)
    }
}
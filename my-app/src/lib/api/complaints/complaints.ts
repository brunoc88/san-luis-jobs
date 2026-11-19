import handleResponse from "@/lib/handleResponse"

let url = '/api/complaints'

export const complaintsApi = {
    getAllActiveComplaints: async (page?:number) => {
        if(!page) page = 1
        const res = await fetch(`${url}?page=${page}`, {
            method: 'GET',
            credentials: 'include'
        })

        return await handleResponse(res)
    },

    delete: async (id:number) => {
        const res = await fetch(`${url}/${id}`,{
            method:'DELETE',
            credentials:'include'
        })

        return await handleResponse(res)
    }
    
}


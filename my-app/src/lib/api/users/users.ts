import handleResponse from "@/lib/handleResponse"

let url = '/api/users'


export const usersApi = {
    registerUser: async (formData: FormData) => {
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
        })

        return await handleResponse(res)
    }
}
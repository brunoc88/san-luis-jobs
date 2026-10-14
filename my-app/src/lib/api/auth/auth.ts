import handleResponse from "@/lib/handleResponse"

let url = '/api/auth'

export const authApi = {
    forgotPassword: async (data: { email: string }) => {
        const res = await fetch(`${url}/forgot-password`, {
            method: 'POST',
            body: JSON.stringify(data)
        })

        return await handleResponse(res)
    }
}
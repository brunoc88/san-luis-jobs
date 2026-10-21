import handleResponse from "@/lib/handleResponse"

let url = '/api/auth'

export const authApi = {
    forgotPassword: async (data: { email: string }) => {
        const res = await fetch(`${url}/forgot-password`, {
            method: 'POST',
            body: JSON.stringify(data)
        })

        return await handleResponse(res)
    },

    checkToken: async (token: string | null) => {
        const res = await fetch(`${url}/reset-password?token=${token}`, {
            method: 'GET'
        })
        return await handleResponse(res)
    },

    resetPassword: async (data: { password: string, password2: string, token: string | null }) => {
        const res = await fetch(`${url}/reset-password`, {
            method: 'POST',
            body: JSON.stringify(data)
        })

        return await handleResponse(res)
    }
}
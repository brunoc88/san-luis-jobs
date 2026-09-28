import { describe, it, expect, vi } from "vitest"
import { POST } from "@/app/api/auth/forgot-password/route"


const makeRequest = (
    data: { email: string },
    headers: Headers
) => {
    return new Request(
        "http://localhost/api/auth/forgot-password",
        {
            method: "POST",
            body: JSON.stringify(data),
            headers
        }
    )
}


describe('Forgot-password rate-limit', () => {
    it('429 Too many requests', async () => {
        const headers = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })

        
        let data = {email: 'test@testmail.com'}
        
        await POST(makeRequest(data, headers))
        await POST(makeRequest(data, headers))
        await POST(makeRequest(data, headers))
        await POST(makeRequest(data, headers))
        await POST(makeRequest(data, headers))
        const res = await POST(makeRequest(data, headers))

        const body = await res.json()
        
        expect(res.status).toBe(429)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('Too many requests')

    })

    it('sin client ip', async () => {
        const headers = new Headers({
            "x-forwarded-for": ""
        })

        
        let data = {email: 'test@testmail.com'}
        
        const res = await POST(makeRequest(data, headers))

        const body = await res.json()
        
        expect(res.status).toBe(400)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('Unable to identify client')

    })
})
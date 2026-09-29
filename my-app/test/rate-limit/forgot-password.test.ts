import { describe, it, expect, vi } from "vitest"
import { POST } from "@/app/api/auth/forgot-password/route"
import { rateLimiter } from "@/lib/rate-limit/rateLimiter"


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
    it('rate-limit ip', async () => {
        const headers = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })


        let data = { email: 'test@testmail.com' }

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


        let data = { email: 'test@testmail.com' }

        const res = await POST(makeRequest(data, headers))

        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('Unable to identify client')

    })

    it('rate-limit email', async () => {
        const headers = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })


        let data = { email: 'test@testmail.com' }

        await POST(makeRequest(data, headers))
        await POST(makeRequest(data, headers))
        await POST(makeRequest(data, headers))
        const res = await POST(makeRequest(data, headers))

        const body = await res.json()

        expect(res.status).toBe(429)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('Too many requests')

    })

    it('Distitas ip mismo email', async () => {
        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })

        const ip2 = new Headers({
            "x-forwarded-for": "200.170.3.20, 11.0.0.2"
        })

        let data = { email: 'test@testmail.com' }

        await POST(makeRequest(data, ip))
        await POST(makeRequest(data, ip2))
        await POST(makeRequest(data, ip))
        const res = await POST(makeRequest(data, ip2))

        const body = await res.json()

        expect(res.status).toBe(429)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('Too many requests')
    })

    it('Misma ip diferentes emails', async () => {
        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10"
        })

        await POST(makeRequest({ email: "a@test.com" }, ip))
        await POST(makeRequest({ email: "b@test.com" }, ip))
        await POST(makeRequest({ email: "c@test.com" }, ip))
        await POST(makeRequest({ email: "d@test.com" }, ip))
        await POST(makeRequest({ email: "e@test.com" }, ip))

        const res = await POST(
            makeRequest({ email: "f@test.com" }, ip)
        )

        expect(res.status).toBe(429)
    })

    it('Expiracion ventanta emails(15 min)', async () => {

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-09-28T10:00:00"))


        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10"
        })

        await POST(makeRequest({ email: "a@test.com" }, ip))
        await POST(makeRequest({ email: "a@test.com" }, ip))
        await POST(makeRequest({ email: "a@test.com" }, ip))

        const res = await POST(makeRequest({ email: "a@test.com" }, ip))
        
        vi.setSystemTime(new Date("2026-09-28T10:15:00"))

        const res2 = await POST(makeRequest({ email: "a@test.com" }, ip))

        expect(res.status).toBe(429)
        expect(res2.status).toBe(200)
    })

    it('Expiracion ventanta ip(60 sec)', async () => {

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-09-28T10:00:00"))


        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10"
        })

        await POST(makeRequest({ email: "a@test.com" }, ip))
        await POST(makeRequest({ email: "b@test.com" }, ip))
        await POST(makeRequest({ email: "c@test.com" }, ip))
        await POST(makeRequest({ email: "d@test.com" }, ip))
        await POST(makeRequest({ email: "e@test.com" }, ip))
        const res = await POST(makeRequest({ email: "a@test.com" }, ip))
        
        vi.setSystemTime(new Date("2026-09-28T10:01:01"))

        const res2 = await POST(makeRequest({ email: "a@test.com" }, ip))

        expect(res.status).toBe(429)
        expect(res2.status).toBe(200)
    })
})
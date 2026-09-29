import { describe, it, expect, vi } from "vitest"
import { GET, POST } from "@/app/api/auth/reset-password/route"



const makeRequest = (
    headers: Headers,
    token: string
) => {
    return new Request(
        `http://localhost/api/auth/reset-password?token=${token}`,
        {
            method: "GET",
            headers
        }
    )
}

const makeRequest2 = (
    headers: Headers,
    data: { token: string, password: string, password2: string }
) => {
    return new Request(
        `http://localhost/api/auth/reset-password`,
        {
            method: "POST",
            body: JSON.stringify(data),
            headers
        }
    )
}

describe('GET rate-limit reset-password ', () => {
    it('Limite por ip', async () => {
        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })

        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        await GET(makeRequest(ip, '1@%$#$%#'))
        const res = await GET(makeRequest(ip, '1@%$#$%#'))
        expect(res.status).toBe(429)
    })
})

describe('POST rate-limit reset-password ', () => {
    it('Limite por ip', async () => {
        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })

        let data = { token: '@!@#!@#', password: 'asdasada', password2: 'asdasada' }

        await POST(makeRequest2(ip, data))
        await POST(makeRequest2(ip, data))
        await POST(makeRequest2(ip, data))
        await POST(makeRequest2(ip, data))
        await POST(makeRequest2(ip, data))
        const res = await POST(makeRequest2(ip, data))
        expect(res.status).toBe(429)
    })

    it('limite por token', async () => {
        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })

        let data = { token: '@!@#!@#', password: 'asdasada', password2: 'asdasada' }

        await POST(makeRequest2(ip, data))
        await POST(makeRequest2(ip, data))
        await POST(makeRequest2(ip, data))
        const res = await POST(makeRequest2(ip, data))
        expect(res.status).toBe(429)
    })

    it('diferentes ip mismo token', async () => {
        const ip = new Headers({
            "x-forwarded-for": "192.168.1.10, 10.0.0.1"
        })

        const ip2 = new Headers({
            "x-forwarded-for": "193.165.1.12, 12.3.0.1"
        })

        let data = { token: '@!@#!@#', password: 'asdasada', password2: 'asdasada' }

        await POST(makeRequest2(ip, data))
        await POST(makeRequest2(ip2, data))
        await POST(makeRequest2(ip, data))
        const res = await POST(makeRequest2(ip, data))
        expect(res.status).toBe(429)
    })
})
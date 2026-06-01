import { it, describe, beforeEach, afterAll, vi, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { GET } from "@/app/api/users/confirm/route"


beforeEach(async () => {
    await prisma.user.deleteMany()
})

const makeRequest = (token: string) => {
    return new Request(`http://localhost/api/user/confirm?${token}`, {
        method: 'GET'
    })
}

describe('api/user/confirm', () => {
    describe('crear cuenta y confirmar con token', () => {
        it('falta token', async () => {
            const res = await GET(makeRequest(''))
            const body = await res?.json()

            expect(res?.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Token requerido')
        })

        it('token inválido', async () => {
            const res = await GET(makeRequest('12345'))
            const body = await res?.json()

            expect(res?.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Token requerido')
        })

    })
})

afterAll(async () => {
    await prisma.$disconnect()
})
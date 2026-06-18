import { vi, describe, it, beforeEach, afterAll, expect } from "vitest"
import { GET } from "@/app/api/auth/reset-password/route"
import { prisma } from "@/lib/prisma"
import { afterEach } from "node:test"
import { mailService } from "@/services/mail.service"
//import { POST } from "@/app/api/auth/forgot-password/route"
import { POST } from "@/app/api/auth/reset-password/route"
import { authService } from "@/services/auth.service"

let capturedToken = ""

beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany()
    await prisma.user.deleteMany()
    capturedToken = ""
})

vi.mock('@/services/mail.service', () => ({
    mailService: {
        sendEmailPasswordRecovery: vi.fn(
            async (email: string, token: string) => {
                capturedToken = token
            }
        )
    }
}))

vi.mock('@/services/auth.service', () => ({
    authService:{
        resetPassword: vi.fn()
    }
}))



const makeRequest = (data: { token: string, password: string, password2: string }) => {
    return new Request(`http://localhost/api/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('POST /api/auth/reset-password', () => {
    describe('validaciones zod', () => {
        it('token vacio', async () => {
            const data = {
                token: '',
                password: 'sekretss',
                password2: 'sekretss'
            }

            const res = await POST(makeRequest(data))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('token')
            expect(body.error.token).toContain('token vacio')
            expect(authService.resetPassword).not.toHaveBeenCalled()
        })

        it('passwords no coinciden', async () => {
            const data = {
                token: '123123',
                password: 'sekretss',
                password2: 'answerss'
            }

            const res = await POST(makeRequest(data))
            const body = await res.json()
            
            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('password2')
            expect(body.error.password2).toContain('Las contraseñas no coinciden')
            expect(authService.resetPassword).not.toHaveBeenCalled()

        })
    })
})
afterEach(() => {
    vi.clearAllMocks()
})

afterAll(async () => {
    prisma.$disconnect()
})

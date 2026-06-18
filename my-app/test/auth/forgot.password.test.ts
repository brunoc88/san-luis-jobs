import { vi, describe, it, beforeEach, afterAll, expect } from "vitest"
import { POST } from "@/app/api/auth/forgot-password/route"
import { prisma } from "@/lib/prisma"
import { afterEach } from "node:test"
import { mailService } from "@/services/mail.service"

beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany()
    await prisma.user.deleteMany()
})

vi.mock('@/services/mail.service', () => ({
    mailService: {
        sendEmailPasswordRecovery: vi.fn()
    }
}))


const makeRequest = (data: { email: string }) => {
    return new Request('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}


describe('POST /api/auth/forgot-password', () => {
    describe('validaciones', () => {
        it('email vacio', async () => {
            const res = await POST(makeRequest({ email: '' }))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).not.toBeNull()
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('email')
            expect(body.error.email).toContain('debe ingresar un email')
        })

        it('email invalido', async () => {
            const res = await POST(makeRequest({ email: '' }))
            const body = await res.json()
            
            expect(res.status).toBe(400)
            expect(body).not.toBeNull()
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('email')
            expect(body.error.email).toContain('email invalido')
        })
    })

    describe('usuario no existentes o inactivos', () => {
        it('usuario inexistente', async () => {
            const res = await POST(makeRequest({email:'fkuser1@test.com'}))
            
            const token = await prisma.emailVerificationToken.findFirst()
            
            expect(res.status).toBe(200)
            expect(token).toBeNull()
            expect(mailService.sendEmailPasswordRecovery).not.toHaveBeenCalled()
        })

        it('usuario inactivo', async () => {

            const user = await prisma.user.create({data:{
                email:'fkuser1@test.com',
                username:'fkuser1',
                password:'sekrets',
                pic:'fake.png'
            }})

            const res = await POST(makeRequest({email:'fkuser1@test.com'}))
            
            const token = await prisma.emailVerificationToken.findFirst()
            
            expect(user.isActive).toBe(false)
            expect(res.status).toBe(200)
            expect(token).toBeNull()
            expect(mailService.sendEmailPasswordRecovery).not.toHaveBeenCalled()
        })

        it('usuario activo', async () => {

            await prisma.user.create({data:{
                email:'fkuser1@test.com',
                username:'fkuser1',
                password:'sekrets',
                pic:'fake.png',
                isActive:true
            }})

            const res = await POST(makeRequest({email:'fkuser1@test.com'}))
            
            const token = await prisma.emailVerificationToken.findFirst()
            
            expect(res.status).toBe(200)
            expect(token).not.toBeNull()
            expect(mailService.sendEmailPasswordRecovery).toHaveBeenCalled()
        })
    })
})

afterEach(()=>{
    vi.clearAllMocks()
})

afterAll(async () => {
    prisma.$disconnect()
})


import { vi, describe, it, beforeEach, afterAll, expect } from "vitest"
import { POST } from "@/app/api/auth/forgot-password/route"
import { prisma } from "@/lib/prisma"
import { afterEach } from "node:test"
import { mailService } from "@/services/mail.service"
import { getUsers, loadUsers } from "../fake.user"

let users: any[]

beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany()
    await prisma.user.deleteMany()
    await loadUsers()
    users = await getUsers()
})

vi.mock('@/services/mail.service', () => ({
    mailService: {
        sendEmailPasswordRecovery: vi.fn(),
        sendInactiveAccountEmail: vi.fn(),
        sendSuspendedAccountEmail: vi.fn()
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


    describe('casos de solicitud', () => {
        it('usuario inexistente', async () => {
            const res = await POST(makeRequest({ email: 'fkuser1@test.com' }))

            expect(res.status).toBe(200)

            expect(mailService.sendEmailPasswordRecovery).not.toHaveBeenCalled()
            expect(mailService.sendInactiveAccountEmail).not.toHaveBeenCalled()
            expect(mailService.sendSuspendedAccountEmail).not.toHaveBeenCalled()
        })

        it('usuario inactivo', async () => {
            const res = await POST(makeRequest({ email: users[5].email }))

            expect(res.status).toBe(200)

            expect(mailService.sendInactiveAccountEmail).toHaveBeenCalled()
            expect(mailService.sendEmailPasswordRecovery).not.toHaveBeenCalled()
            expect(mailService.sendSuspendedAccountEmail).not.toHaveBeenCalled()
        })

        it('usuario suspendido', async () => {

            // editamos usuario

            await prisma.user.update({ data: { isSuspended: true, isActive: false }, where: { id: users[5].id } })
            const res = await POST(makeRequest({ email: users[5].email }))

            expect(res.status).toBe(200)

            expect(mailService.sendInactiveAccountEmail).not.toHaveBeenCalled()
            expect(mailService.sendEmailPasswordRecovery).not.toHaveBeenCalled()
            expect(mailService.sendSuspendedAccountEmail).toHaveBeenCalled()
        })

        it('usuario activo con token', async () => {

            // creamos token para el usuario

            const newToken = await prisma.emailVerificationToken.create({
                data: {
                    token: "$%^Q@#$",
                    userId: users[0].id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            })


            const res = await POST(makeRequest({ email: users[0].email }))

            const oldToken = await prisma.emailVerificationToken.findUnique({ where: { token: newToken.token } })
            const newToken2 = await prisma.emailVerificationToken.findUnique({ where: { userId: users[0].id } })

            expect(res.status).toBe(200)
            expect(oldToken).toBeNull()
            expect(newToken2).not.toBeNull()
            expect(mailService.sendInactiveAccountEmail).not.toHaveBeenCalled()
            expect(mailService.sendSuspendedAccountEmail).not.toHaveBeenCalled()
            expect(mailService.sendEmailPasswordRecovery).toHaveBeenCalled()

        })

        it('usuario activo sin token', async () => {

            // verificamos token 
            const verifyToken = await prisma.emailVerificationToken.findUnique({where:{userId:users[0].id}})
            
            const res = await POST(makeRequest({ email: users[0].email }))

            // verificamos si se creo token
            const newToken = await prisma.emailVerificationToken.findUnique({where:{userId:users[0].id}})

            expect(res.status).toBe(200)
            expect(verifyToken).toBeNull()
            expect(newToken).not.toBeNull()
            expect(mailService.sendInactiveAccountEmail).not.toHaveBeenCalled()
            expect(mailService.sendSuspendedAccountEmail).not.toHaveBeenCalled()
            expect(mailService.sendEmailPasswordRecovery).toHaveBeenCalled()

        })
    })


})

afterEach(() => {
    vi.clearAllMocks()
})

afterAll(async () => {
    prisma.$disconnect()
})


import { vi, beforeEach, afterEach, afterAll, describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { PATCH } from "@/app/api/users/me/email/route"
import { loadUsers, getUsers } from "../fake.user"
import clearTestDb from "../clearTestDb"
import { getServerSession } from "next-auth"
import { mailService } from "@/services/mail.service"
import { GET } from "@/app/api/users/me/email/verify/route"
import { NextRequest } from "next/server"


let users: any[]
let capturedToken:string = ''

beforeEach(async () => {
    await clearTestDb()
    await loadUsers()
    users = await getUsers()
})

vi.mock('@/services/mail.service', () => ({
    mailService: {
        sendChangeEmailVerification: vi.fn(async (email: string, token: string) => {
            capturedToken = token
        })
    }
}))

vi.mock('next-auth', async () => {
    const actual = await vi.importActual<any>('next-auth')
    return {
        ...actual,
        getServerSession: vi.fn(),
    }
})

const mockAuthenticatedSession = (i: number) => {
    (getServerSession as any).mockResolvedValue({
        user: {
            id: users[i].id,
            email: users[i].email,
            name: users[i].username,
            role: users[i].role
        }
    })
}

const mackeRequest = (data: { email: string }) => {
    return new Request('http://localhost/api/users/me/email', {
        method: 'PATCH',
        body: JSON.stringify(data)
    })
}

describe('PATCH /api/users/me/email', () => {
    it('validacion zod', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(mackeRequest({ email: 'user' }))
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error).toHaveProperty('email')
        expect(body.error.email).toContain('email invalido')
    })

    it('mandar el mismo email', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(mackeRequest({ email: 'admin1@test.com' }))
        const body = await res.json()

        expect(res.status).toBe(403)
        expect(body.error).toBe('El email es el mismo')


    })

    it('duplicado', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(mackeRequest({ email: 'admin2@test.com' }))
        const body = await res.json()

        expect(res.status).toBe(409)
        expect(body.error).toBe('email no disponible')
    })

    it('envio valido', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(mackeRequest({ email: 'pepe88@test.com' }))
        const body = await res.json()

        const user = await prisma.user.findUnique({ where: { id: users[0].id } })
        const token = await prisma.emailVerificationToken.findUnique({ where: { userId: users[0].id } })

        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(user?.pendingEmail).not.toBeNull()
        expect(user?.pendingEmail).toBe('pepe88@test.com')
        expect(token).not.toBeNull()
        expect(mailService.sendChangeEmailVerification).toHaveBeenCalled()
    })

})

describe('GET /api/users/me/email/verify?token=', () => {
    it('obtencion de token y remplazo de email', async () => {
        mockAuthenticatedSession(0)

        await PATCH(mackeRequest({ email: 'pepe88@test.com' }))
        const tokenBf = await prisma.emailVerificationToken.findUnique({ where: { userId: users[0].id } })
        const userBefore = await prisma.user.findUnique({ where: { id: users[0].id } })

        const res = await GET(new NextRequest(`http://localhost/api/users/me/email/verify?token=${capturedToken}`))

        const body = await res.json()
        const userAfter = await prisma.user.findUnique({ where: { id: users[0].id } })
        const tokenAf = await prisma.emailVerificationToken.findUnique({ where: { userId: users[0].id } })

        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)

        expect(userBefore?.email).toBe('admin1@test.com')
        expect(userBefore?.pendingEmail).not.toBeNull()
        expect(userBefore?.pendingEmail).toBe('pepe88@test.com')
        expect(userAfter?.email).toBe('pepe88@test.com')
        expect(userAfter?.pendingEmail).toBeNull()
        expect(tokenBf).not.toBeNull()
        expect(tokenAf).toBeNull()

    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
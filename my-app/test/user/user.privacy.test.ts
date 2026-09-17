import { vi, beforeEach, afterEach, afterAll, describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { PATCH } from "@/app/api/users/me/privacy/route"
import { loadUsers, getUsers } from "../fake.user"
import clearTestDb from "../clearTestDb"
import { getServerSession } from "next-auth"

let users: any[]

beforeEach(async () => {
    await clearTestDb()
    await loadUsers()
    users = await getUsers()
})


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

afterEach(() => {
    vi.clearAllMocks()
})

describe('PATCH /api/users/me/privacy', () => {
    it('cambiar perfil publico a privado', async () => {
        mockAuthenticatedSession(0)

        const userPrivacyBefore = await prisma.user.findUnique({ where: { id: users[0].id } })

        const res = await PATCH()
        const body = await res.json()

        const userPrivacyAfter = await prisma.user.findUnique({ where: { id: users[0].id } })

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
        expect(userPrivacyBefore?.visibility).toBe(true)
        expect(userPrivacyAfter?.visibility).toBe(false)

    })

    it('cambiar perfil privado a publico', async () => {
        mockAuthenticatedSession(0)

        // el perfil es publico asi que lo convertimos a privado
        const userPrivacyBefore = await prisma.user.update({data:{visibility:false},where:{id:users[0].id}})
         
        const res = await PATCH()
        const body = await res.json()

        const userPrivacyAfter = await prisma.user.findUnique({ where: { id: users[0].id } })

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
        expect(userPrivacyBefore?.visibility).toBe(false)
        expect(userPrivacyAfter?.visibility).toBe(true)

    })
})

afterAll(async () => {
    await prisma.$disconnect()
})
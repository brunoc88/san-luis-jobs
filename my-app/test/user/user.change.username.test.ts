import { vi, beforeEach, afterEach, afterAll, describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { PATCH } from "@/app/api/users/me/username/route"
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

const mackeRequest = (data: { username: string }) => {
    return new Request('http://localhost/api/users/me/username', {
        method: 'PATCH',
        body: JSON.stringify(data)
    })
}

describe('PATCH /api/users/me/username', () => {
    it('validacion zod', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(mackeRequest({ username: '' }))
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error).toHaveProperty('username')
        expect(body.error.username).toContain('debe ingresar un nombre de usuario')
    })

    it('duplicado', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(mackeRequest({ username: 'admin2' }))
        const body = await res.json()
        
        expect(res.status).toBe(409)
        expect(body.error).toBe('El campo username ya está en uso')
        
    })

    it('cambio valido', async () => {
        mockAuthenticatedSession(0)

        const usernameBefore = users[0].username

        const res = await PATCH(mackeRequest({ username: 'pepe123' }))
        const body = await res.json()

        const usernameAfter = await prisma.user.findUnique({where:{id:users[0].id}})

        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(usernameAfter?.username).not.toBe(usernameBefore)
        
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
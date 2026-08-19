import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { POST } from "@/app/api/feedback/route"
import clearTestDb from "../clearTestDb"

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

const makeRequest = (data: { opinion: string }) => {
    return new Request('http://localhost/api/feedback', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('POST /api/feedback', () => {
    describe('validaciones zod', () => {
        it('opinion vacia', async () => {
            mockAuthenticatedSession(0)

            const res = await POST(makeRequest({ opinion: '' }))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('opinion')
            expect(body.error.opinion).toContain('debe ingresar una opinión')

        })

        it('min 10 caracteres', async () => {
            mockAuthenticatedSession(0)

            const res = await POST(makeRequest({ opinion: 'opino que' }))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('opinion')
            expect(body.error.opinion).toContain('min 10 caracteres')

        })
    })

    it('feedback valido', async () => {
        mockAuthenticatedSession(0)

        const res = await POST(makeRequest({ opinion: 'muy buena pag para encontrar trabajo en la provincia!'}))
        const body = await res.json()
        
        expect(res.status).toBe(201)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
    })
})


afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { GET } from "@/app/api/feedback/[id]/route"
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


describe('GET /api/feedback/:id', () => {
    it('feedback no encontrado', async () => {
        mockAuthenticatedSession(0)

        const res = await GET({ params: { id: 10 } })

        expect(res.status).toBe(404)
    })

    it('feedback detallado', async () => {
        mockAuthenticatedSession(0)

        const feeback = await prisma.feedback.create({
            data: {
                opinion: 'Muy buen sitio para buscar empleo en la provincia',
                userId: users[0].id
            }
        })

        const res = await GET({ params: { id: feeback.id } })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('feedback')
        expect(body.feedback).toHaveProperty('opinion')
        expect(body.feedback).toHaveProperty('user')
        expect(body.feedback.user).toHaveProperty('username')
    })

})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
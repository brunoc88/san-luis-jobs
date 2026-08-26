import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { GET } from "@/app/api/feedback/route"
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

describe('GET /api/feedback', () => {
    it('Obtener feedbacks', async () => {
        mockAuthenticatedSession(0)
        // cargo algunos
        const opinion = 'muy buen sitio web'

        await prisma.feedback.createMany({
            data: [{
                userId: users[0].id,
                opinion
            },
            {
                userId: users[1].id,
                opinion
            },
            {
                userId: users[2].id,
                opinion
            },
            {
                userId: users[3].id,
                opinion
            },
            {
                userId: users[4].id,
                opinion
            },
            {
                userId: users[5].id,
                opinion
            },
            ]
        })

        const res = await GET()
        const body = await res.json()
        console.log('feedback:', body.feedbacks)
        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(body.feedbacks).not.toBeNull()
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
import { describe, it, beforeEach, afterAll, afterEach, vi, expect } from "vitest"
import { getServerSession } from "next-auth"
import { loadJobs, getJobs } from "../fakeJobs"
import { getUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { DELETE, POST } from "@/app/api/jobs/[id]/save/route"

let users: any[]
let jobs: any[]

beforeEach(async () => {
    await prisma.savedJob.deleteMany()
    await prisma.warning.deleteMany()
    await prisma.job.deleteMany()
    await prisma.user.deleteMany()
    await prisma.location.deleteMany()
    await loadJobs()

    users = await getUsers()
    jobs = await getJobs()
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

describe('DELTE /api/job/:id/save', () => {
    it('eliminar de guardados un job que inexistente', async () => {
        mockAuthenticatedSession(0)

        const res = await DELETE({ params: { id: '10' } })
        expect(res.status).toBe(404)

    })

    it('eliminar de guardados un job correctamente', async () => {
        mockAuthenticatedSession(1)

        await POST({ params: { id: String(jobs[0].id) } })

        const res = await DELETE({ params: { id: String(jobs[0].id) } })
        expect(res.status).toBe(200)

    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
import { describe, it, beforeEach, afterAll, afterEach, vi, expect } from "vitest"
import { getServerSession } from "next-auth"
import { loadJobs, getJobs } from "../fakeJobs"
import { getUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { POST } from "@/app/api/jobs/[id]/save/route"

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



describe('POST /api/jobs/:id/save', () => {
    it('autor guarda su publicacion', async () => {
        mockAuthenticatedSession(0)

        const res = await POST({ params: { id: String(jobs[0].id) } })

        expect(res.status).toBe(403)

    })

    it('guardar dos veces el mismo job', async () => {
        mockAuthenticatedSession(1)

        await POST({ params: { id: String(jobs[0].id) } })
        const res = await POST({ params: { id: String(jobs[0].id) } })

        expect(res.status).toBe(409)

    })

    it('guardar job correctamente', async () => {
        mockAuthenticatedSession(1)

        const res = await POST({ params: { id: String(jobs[0].id) } })
        const body = await res.json()

        expect(res.status).toBe(201)
        expect(body.ok).toBe(true)
    })

    it('guardar job en estado finalizado', async () => {
        mockAuthenticatedSession(1)

        const job = await prisma.job.update({data:{state:"finished"},where:{id:jobs[0].id}})

        const res = await POST({ params: { id: String(job.id) } })
        const body = await res.json()

        expect(res.status).toBe(403)
        expect(body.error).toBe("No es posible guardar una publicación finalizada.")
    })
})
afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
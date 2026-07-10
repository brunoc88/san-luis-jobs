import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers } from "../fake.user"
import { DELETE } from "@/app/api/jobs/[id]/route"
import { getJobs, loadJobs } from "../fakeJobs"

let users: any[]
let jobs: any[]

beforeEach(async () => {
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


describe('DELETE /api/jobs/:id', () => {
    it('mandar id de letras', async () => {
        mockAuthenticatedSession(0)

        const res = await DELETE({ params: { id: 'abc' } })
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('ID inválido.')
    })

    describe('requireActiveJobById', () => {
        it('job inexistente', async () => {
            mockAuthenticatedSession(0)

            const res = await DELETE({ params: { id: 10 } })
            const body = await res.json()

            expect(res.status).toBe(404)
            expect(body.error).toBe('job no encontrado')
        })

        it('job inactivo/borrado ', async () => {
            mockAuthenticatedSession(0)

            //descativo el job
            const job = await prisma.job.update({ data: { isActive: false }, where: { id: jobs[0].id } })

            const res = await DELETE({ params: { id: job.id } })
            const body = await res.json()

            expect(res.status).toBe(404)
            expect(body.error).toBe('job no encontrado')
        })

        it('job inactivo/borrado ', async () => {
            mockAuthenticatedSession(0)

            //suspendo el job
            const job = await prisma.job.update({ data: { isSuspended: true }, where: { id: jobs[0].id } })

            const res = await DELETE({ params: { id: job.id } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('job eliminado por violacion')
        })
    })

    it('descativar un job no siendo el autor', async () => {
        mockAuthenticatedSession(1)

        const res = await DELETE({ params: { id: jobs[0].id } })
        const body = await res.json()

        expect(res.status).toBe(403)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('No tenés permiso para eliminar este empleo')
    })

    it('descativar un job no siendo el autor', async () => {
        mockAuthenticatedSession(0)

        const res = await DELETE({ params: { id: jobs[0].id } })
        const body = await res.json()

        const job = await prisma.job.findUnique({where:{id:jobs[0].id}})

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
        expect(job).not.toBeNull()
        expect(job?.isActive).toBe(false)
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
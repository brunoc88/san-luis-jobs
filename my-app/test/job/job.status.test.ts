import { describe, it, beforeEach, afterAll, afterEach, vi, expect } from "vitest"
import { getServerSession } from "next-auth"
import { loadJobs, getJobs } from "../fakeJobs"
import { getUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { PATCH } from "@/app/api/jobs/[id]/state/route"
import { POST } from "@/app/api/jobs/[id]/apply/route"

let users: any[]
let jobs: any[]

beforeEach(async () => {
    await prisma.application.deleteMany()
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

const closeMockAuthenticatedSession = () => {
    (getServerSession as any).mockResolvedValue(null)
}

const makeRequest = (data: { state: string }, id: string) => {
    return new Request(`http://localhost/api/job/${id}/state`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('PATCH /api/job/:id/state', () => {

    describe('casos de cambio de estado', () => {
        it('job no siendo el autor', async () => {
            mockAuthenticatedSession(0)

            const res = await PATCH(makeRequest({ state: 'finished' }, jobs[1].id), { params: { id: jobs[1].id } })

            expect(res.status).toBe(403)
        })

        it('job finished & con limite de aplicantes completado', async () => {

            // edito un job con limite 1 de aplicantes

            await prisma.job.update({ data: { applicationLimit: 1 }, where: { id: jobs[0].id } })


            // aplico al job
            mockAuthenticatedSession(1)

            // cargo cv fake para aplicar
            await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[1].id } })
            await POST({ params: { id: jobs[0].id } })


            // cierro session
            closeMockAuthenticatedSession()

            // luego el autor intenta cambiar su estadon a activo
            mockAuthenticatedSession(0)

            const res = await PATCH(makeRequest({ state: 'active' }, jobs[0].id), { params: { id: jobs[0].id } })
            const body = await res.json()


            expect(res.status).toBe(400)
            expect(body.error).toBe("No es posible cambiar el estado porque la publicación ya alcanzó el límite de postulaciones. Aumentá el límite antes de reactivarla.")

        })

        it('job finished & con limite de aplicantes no completado', async () => {

            // edito un job con limite 1 de aplicantes

            await prisma.job.update({ data: { applicationLimit: 2 }, where: { id: jobs[0].id } })

            // aplico al job
            mockAuthenticatedSession(1)

            // cargo cv fake para aplicar
            await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[1].id } })
            await POST({ params: { id: jobs[0].id } })

            // lo finalizo
            await prisma.job.update({ data: { state: 'finished' }, where: { id: jobs[0].id } })


            // cierro session
            closeMockAuthenticatedSession()

            // luego el autor intenta cambiar su estadon a activo
            mockAuthenticatedSession(0)

            const res = await PATCH(makeRequest({ state: 'active' }, jobs[0].id), { params: { id: jobs[0].id } })
            const body = await res.json()

            expect(res.status).toBe(200)

        })

        it('de activo a pausado sin limite de aplicantes', async () => {
            mockAuthenticatedSession(0)

            const res = await PATCH(makeRequest({ state: 'paused' }, jobs[0].id), { params: { id: jobs[0].id } })
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)

        })

        it('enviar un estado diferente', async () => {
            mockAuthenticatedSession(0)

            const res = await PATCH(makeRequest({ state: 'stop' }, jobs[0].id), { params: { id: jobs[0].id } })
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body.error.state).toContain('Estado inválido.')

        })
    })

})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
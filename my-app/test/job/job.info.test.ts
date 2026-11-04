import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers } from "../fake.user"
import { getJobs, loadJobs } from "../fakeJobs"
import { GET } from "@/app/api/jobs/[id]/route"
import { POST } from "@/app/api/jobs/[id]/apply/route"
import clearTestDb from "../clearTestDb"

let users: any[]
let jobs: any[]

beforeEach(async () => {
    await clearTestDb()
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

// IMPORTANTE!
// AGREGARLE REQUEST!
// PARA PODER OPTENER EL IP


const makeRequest = (id: number) => {
    return new Request(`http://localhost/api/jobs/${id}`, {
        method: "GET",
        headers: {
            "x-forwarded-for": "192.168.1.100",
        },
    })
}

describe('GET /api/jobs/:id', () => {
    describe('tipo de informacion', () => {
        it('sin session', async () => {
            const res = await GET(makeRequest(jobs[0].id), {
                params: Promise.resolve({ id: String(jobs[0].id) })
            })
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('job')
            expect(body.ok).toBe(true)
            expect(body.job).not.toHaveProperty('alreadyApplied')
            expect(body.job).not.toHaveProperty('alreadySaved')
            expect(body.job).not.toHaveProperty('numberOfApplicants')
            expect(body.job).not.toHaveProperty('applicationLimit')
            expect(body.job).not.toHaveProperty('userId')
            expect(body.job).not.toHaveProperty('locationId')
            expect(body.job).toHaveProperty('owner')
            expect(body.job.owner).toBe(false)
        })

        it('con session & no siendo autor, sin aplicar & sin guardar', async () => {
            mockAuthenticatedSession(1)

            const res = await GET(makeRequest(jobs[0].id), {
                params: Promise.resolve({ id: String(jobs[0].id) })
            })
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('job')
            expect(body.ok).toBe(true)
            expect(body.job).toHaveProperty('alreadyApplied')
            expect(body.job).toHaveProperty('numberOfApplicants')
            expect(body.job).toHaveProperty('applicationLimit')
            expect(body.job).not.toHaveProperty('userId')
            expect(body.job).not.toHaveProperty('locationId')
            expect(body.job.alreadyApplied).toBe(false)
            expect(body.job.alreadySaved).toBe(false)
            expect(body.job.numberOfApplicants).not.toBeNull()
            expect(body.job.owner).toBe(false)
        })

        it('con session & postulado', async () => {
            mockAuthenticatedSession(1)

            await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[1].id } })

            await POST({ params: Promise.resolve({ id: String(jobs[0].id) }) })

            const res = await GET(makeRequest(jobs[0].id), {
                params: Promise.resolve({ id: String(jobs[0].id) })
            })
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('job')
            expect(body.ok).toBe(true)
            expect(body.job).toHaveProperty('alreadyApplied')
            expect(body.job).toHaveProperty('alreadySaved')
            expect(body.job.alreadyApplied).toBe(true)
            expect(body.job.alreadySaved).toBe(false)
            expect(body.job.owner).toBe(false)
            expect(body.job).not.toHaveProperty('numberOfApplicants')
            expect(body.job).not.toHaveProperty('applicationLimit')

        })

        it('con session & job guardado', async () => {
            mockAuthenticatedSession(1)

            // Guardo el job

            await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[0].id } })

            const res = await GET(makeRequest(jobs[0].id), { params: Promise.resolve({ id: jobs[0].id }) })
            const body = await res.json()

            expect(body.job).toHaveProperty('alreadySaved')
            expect(body.job.alreadySaved).toBe(true)

        })

        it('con sesion & siendo autor', async () => {
            mockAuthenticatedSession(0)

            const res = await GET(makeRequest(jobs[0].id), { params: Promise.resolve({ id: jobs[0].id }) })
            const body = await res.json()

            expect(body.job).toHaveProperty('numberOfApplicants')
            expect(body.job).toHaveProperty('applicationLimit')
            expect(body.job).not.toHaveProperty('alreadySaved')
            expect(body.job).not.toHaveProperty('alreadyApply')
            expect(body.job).toHaveProperty('owner')
            expect(body.job.owner).toBe(true)

        })
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
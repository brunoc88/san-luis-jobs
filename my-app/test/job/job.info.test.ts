import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers } from "../fake.user"
import { getJobs, loadJobs } from "../fakeJobs"
import { GET } from "@/app/api/jobs/[id]/route"
import { POST } from "@/app/api/jobs/[id]/apply/route"

let users: any[]
let jobs: any[]

beforeEach(async () => {
    await prisma.application.deleteMany()
    await prisma.complaint.deleteMany()
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

describe('GET /api/jobs/:id', () => {
    describe('tipo de informacion', () =>{
        it('sin session', async () => {
            const res = await GET({ params: { id: jobs[0].id } })
            const body = await res.json()
            
            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('job')
            expect(body.ok).toBe(true)
            expect(body.job).not.toHaveProperty('alreadyApplied')
            expect(body.job).not.toHaveProperty('numberOfApplicants')
        })

        it('con session', async () => {
            mockAuthenticatedSession(0)

            const res = await GET({ params: { id: jobs[0].id } })
            const body = await res.json()
            
            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('job')
            expect(body.ok).toBe(true)
            expect(body.job).toHaveProperty('alreadyApplied')
            expect(body.job).toHaveProperty('numberOfApplicants')
            expect(body.job.alreadyApplied).toBe(false)
            expect(body.job.numberOfApplicants).not.toBeNull()
        })

        it('con session & postulado', async () => {
            mockAuthenticatedSession(1)

            await prisma.user.update({data:{cv:'fakeCv.pdf'}, where:{id:users[1].id}})

            await POST({params: { id: jobs[0].id }})

            const res = await GET({ params: { id: jobs[0].id } })
            const body = await res.json()
            
            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('job')
            expect(body.ok).toBe(true)
            expect(body.job).toHaveProperty('alreadyApplied')
            expect(body.job).toHaveProperty('alreadyApplied')
            expect(body.job.alreadyApplied).toBe(true)
        })
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
import { it, describe, beforeEach, afterAll, afterEach, vi, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { GET } from "@/app/api/users/[username]/route"
import { getUsers } from "../fake.user"
import clearTestDb from "../clearTestDb"
import { getJobs, loadJobs } from "../fakeJobs"

let users: any[]
let jobs: any[]

beforeEach(async () => {
    await clearTestDb()
    await loadJobs()

    users = await getUsers()
    jobs = await getJobs()

    await saveJobs()

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

const mackeRequest = async (name: string) => {
    return await GET({ params: { username: name } })
}

const saveJobs = async () => {

    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[0].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[2].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[3].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[4].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[7].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[5].id } }) // suspendido
}

describe('GET /api/users/username', () => {
    describe('ver info de usuario', () => {
        it('ver perfil de usuario publico', async () => {
            mockAuthenticatedSession(6)

            const res = await mackeRequest('common1')
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('user')
            expect(body.user).toHaveProperty('username')
            expect(body.user).toHaveProperty('pic')
            expect(body.user).toHaveProperty('email')
            expect(body.user).toHaveProperty('description')
            expect(body.user).toHaveProperty('jobs')
            expect(body.user.jobs.every((job: any) => !Object.hasOwn(job, 'state'))).toBe(true)
            expect(body.user.isPublic).toBe(true)
            expect(body.user).not.toHaveProperty('savedJobs')
        })

        it('ver propio perfil', async () => {
            mockAuthenticatedSession(1)

            const res = await mackeRequest('admin2')
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.user.jobs.every((job: any) => Object.hasOwn(job, 'state'))).toBe(true)
            expect(body.user).toHaveProperty('savedJobs')
        })

        it('ver perfil privado', async () => {
            mockAuthenticatedSession(0)

            // lo hacemos privado
            await prisma.user.update({ data: { visibility: false }, where: { id: users[1].id } })

            const res = await mackeRequest('admin2')
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('user')
            expect(body.user).toHaveProperty('username')
            expect(body.user).toHaveProperty('pic')
            expect(body.user).not.toHaveProperty('email')
            expect(body.user).not.toHaveProperty('description')
            expect(body.user).not.toHaveProperty('jobs')
            expect(body.user).not.toHaveProperty('savedJobs')
            expect(body.user.isPublic).toBe(false)

        })
    })
})


afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
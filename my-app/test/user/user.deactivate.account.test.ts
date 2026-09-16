import { vi, beforeEach, afterEach, afterAll, describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { PATCH } from "@/app/api/users/me/deactivate/route"
import { getJobs, loadJobs } from "../fakeJobs"
import { getUsers } from "../fake.user"
import clearTestDb from "../clearTestDb"
import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"

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

const saveJobs = async () => {
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[0].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[2].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[3].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[4].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[7].id } })
}

const mackeRequest = async (data: { password: string }) => {
    return await PATCH(new NextRequest('http://localhost/api/users/me/password', {
        body: JSON.stringify(data),
        method: 'PATCH'
    }))
}



describe('PATCH /api/users/me/deactivate', () => {
    it('desactivar mi cuenta', async () => {
        // tuvimos que actualizar el password 
        // ya que minimo se pido 8 caracteres

        const newPassword = await bcrypt.hash('sekretss', 10)
        await prisma.user.update({data:{password:newPassword}, where:{id:users[1].id}})

        mockAuthenticatedSession(1)

        const res = await mackeRequest({ password: 'sekretss' })
        const body = await res.json()
        
        const myJobs = await prisma.job.findMany({ where: { userId: users[1].id, isActive: true } })
        const mySavedJobs = await prisma.savedJob.findMany({ where: { userId: users[1].id } })
        const myAccount = await prisma.user.findUnique({ where: { id: users[1].id } })

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
        expect(myJobs.length).toBe(0)
        expect(mySavedJobs.length).toBe(0)
        expect(myAccount?.isActive).toBe(false)


    })

    it('password incorrecto', async () => {

        mockAuthenticatedSession(1)

        const res = await mackeRequest({ password: 'abcdefgh' })
        const body = await res.json()

        expect(res.status).toBe(403)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('password incorrecto')
       
    })

    it('validacion de password', async () => {

        mockAuthenticatedSession(1)

        const res = await mackeRequest({ password: 'abcd' })
        const body = await res.json()
    

        expect(res.status).toBe(400)
        expect(body).toHaveProperty('error')
        expect(body.error).toHaveProperty('password')
        expect(body.error.password).toContain('minimo 8 caracteres')
       
    })
})


afterEach(() => {
    vi.clearAllMocks()
})

afterAll(async () => {
    await prisma.$disconnect()
})
import { vi, it, describe, beforeEach, afterEach, afterAll, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { getUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { POST } from "@/app/api/jobs/[id]/suspend/route"
import { PATCH } from "@/app/api/users/[id]/suspended/route"
import { loadJobs } from "../fakeJobs"
import { mailService } from "@/services/mail.service"

let users: any[]

beforeEach(async () => {
    await clearTestDb()
    await loadJobs()
    users = await getUsers()
})

vi.mock('next-auth', async () => {
    const actual = await vi.importActual<any>('next-auth')
    return {
        ...actual,
        getServerSession: vi.fn(),
    }
})

vi.mock('@/services/mail.service', () => ({
  mailService: {
    sendSuspendedAccountActivatedEmail: vi.fn()
  }
}))
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

const makeRequest = (data: any, id: string) => {
    return new Request(`http://localhost/api/job/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('PATCH /api/users/:id/suspended', () => {
    describe('casos', () => {
        it('entrar como admin', async () => {
            mockAuthenticatedSession(0)

            const res = await PATCH({ params: { id: users[3].id } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('Acceso prohibido')
        })

        it('levantar propia suspension', async () => {
            // edito el usuario 
            // doy role superAdmin para que pueda iniciar session como tal
            // ya que este endpoint es solo para superAdmins

            await prisma.user.update({
                where: { id: users[3].id },
                data: {
                    role: 'superAdmin',
                    isActive: true,
                    isSuspended: false
                }
            })
            const jobsByUserId = await prisma.job.findMany({ where: { userId: users[3].id } })

            await prisma.warning.createMany({
                data: [{
                    jobId: jobsByUserId[0].id,
                    userId: users[3].id,
                    reason: 'inflige las normas',
                    adminId: users[0].id
                },

                {
                    jobId: jobsByUserId[1].id,
                    userId: users[3].id,
                    reason: 'inflige las normas',
                    adminId: users[0].id
                }]
            })
            mockAuthenticatedSession(3)
            const res = await PATCH({ params: { id: users[3].id } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('No puedes levantar tu propia suspension!')

        })

        it('levantar suspension de otro susperAdmin', async () => {
            // edito el usuario 
            // doy role superAdmin, desactivo su cuenta y la suspendo
            // este proceso se hace manual para no tener que hacer POST para suspender

            await prisma.user.update({ data: { role: 'superAdmin', isActive: false, isSuspended: true }, where: { id: users[3].id } })

            const jobsByUserId = await prisma.job.findMany({ where: { userId: users[3].id } })

            await prisma.warning.createMany({
                data: [{
                    jobId: jobsByUserId[0].id,
                    userId: users[3].id,
                    reason: 'inflige las normas',
                    adminId: users[0].id
                },

                {
                    jobId: jobsByUserId[1].id,
                    userId: users[3].id,
                    reason: 'inflige las normas',
                    adminId: users[0].id
                }]
            })
            mockAuthenticatedSession(6)
            const res = await PATCH({ params: { id: users[3].id } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('No puedes levantar suspension de otro superAdmin')

        })

        it('levantar suspension cuando ya lo estaba', async () => {
            mockAuthenticatedSession(6)

            await prisma.user.update({ data: { isActive: true, isSuspended: false }, where: { id: users[3].id } })
            const res = await PATCH({ params: { id: users[3].id } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('suspension ya levantada')

        })

    })
    it('levantar suspension de usuario', async () => {
        // para este test se modifico el limite de suspenciones a 2

        mockAuthenticatedSession(6)
        const jobsByUserId = await prisma.job.findMany({ where: { userId: users[3].id } })

        await prisma.warning.create({
            data: {
                jobId: jobsByUserId[0].id,
                userId: users[3].id,
                reason: 'inflige las normas',
                adminId: users[0].id
            }
        })


        await POST(makeRequest({ reason: 'inflige las normas' }, String(jobsByUserId[1].id)), { params: { id: jobsByUserId[1].id } })

        const suspendedUserBefore = await prisma.user.findUnique({ where: { id: users[3].id } })
        const userWarningsBefore = await prisma.warning.findMany({ where: { userId: users[3].id, isActive: true } })

        expect(userWarningsBefore).not.toBeNull()
        expect(userWarningsBefore.length).toBe(2)
        expect(suspendedUserBefore?.isActive).toBe(false)
        expect(suspendedUserBefore?.isSuspended).toBe(true)

        const res = await PATCH({ params: { id: users[3].id } })

        const suspendedUserAfter = await prisma.user.findUnique({ where: { id: users[3].id } })
        const userWarningsAfter = await prisma.warning.findMany({ where: { userId: users[3].id, isActive: true } })

        expect(res.status).toBe(200)
        expect(userWarningsAfter.length).toBe(0)
        expect(suspendedUserAfter?.isActive).toBe(true)
        expect(suspendedUserAfter?.isSuspended).toBe(false)
        expect(mailService.sendSuspendedAccountActivatedEmail).toHaveBeenCalled()
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers } from "../fake.user"
import { POST } from "@/app/api/jobs/[id]/suspend/route"
import { getJobs, loadJobs } from "../fakeJobs"
import { mailService } from "@/services/mail.service"

let users: any[]
let jobs: any[]

beforeEach(async () => {
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

vi.mock('@/services/mail.service', () => ({
    mailService: {
        sendJobSuspendedEmail: vi.fn(),
        sendAccountSuspendedEmail: vi.fn()
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

describe('POST /api/job/:id/suspend', () => {
    it('validaciones zod', async () => {
        mockAuthenticatedSession(0)

        let data = {
            reason: ''
        }

        const res = await POST(makeRequest(data, String(jobs[0].id)), { params: { id: jobs[0].id } })
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error).toHaveProperty('reason')
        expect(body.error.reason).toContain('debe ingresar una razon')
    })

    describe('casos de intentos de suspension', () => {
        it('siendo el autor', async () => {
            mockAuthenticatedSession(0)

            let data = {
                reason: 'Inflige las normas'
            }

            const res = await POST(makeRequest(data, String(jobs[0].id)), { params: { id: jobs[0].id } })

            expect(res.status).toBe(403)
        })

        it('teniendo el mismo rol', async () => {
            mockAuthenticatedSession(0)

            let data = {
                reason: 'Inflige las normas'
            }

            const res = await POST(makeRequest(data, String(jobs[1].id)), { params: { id: jobs[1].id } })

            expect(res.status).toBe(403)
        })

        it('usuario rol common', async () => {
            mockAuthenticatedSession(3)

            let data = {
                reason: 'Inflige las normas'
            }

            const res = await POST(makeRequest(data, String(jobs[1].id)), { params: { id: jobs[1].id } })

            expect(res.status).toBe(403)
        })

        it('admin suspendiendo job de susper', async () => {
            mockAuthenticatedSession(0)

            let data = {
                reason: 'Inflige las normas'
            }

            const res = await POST(makeRequest(data, String(jobs[4].id)), { params: { id: jobs[4].id } })

            expect(res.status).toBe(403)
        })

        it('admin suspendiendo job de susper', async () => {
            mockAuthenticatedSession(0)

            let data = {
                reason: 'Inflige las normas'
            }

            const res = await POST(makeRequest(data, String(jobs[4].id)), { params: { id: jobs[4].id } })

            expect(res.status).toBe(403)
        })
    })

    describe('envios de email', () => {
        it('suspencion de job', async () => {
            mockAuthenticatedSession(0)

            let data = {
                reason: 'Inflige las normas'
            }

            const res = await POST(makeRequest(data, String(jobs[2].id)), { params: { id: jobs[2].id } })

            expect(res.status).toBe(201)
            expect(mailService.sendJobSuspendedEmail).toHaveBeenCalled()
            expect(mailService.sendAccountSuspendedEmail).not.toHaveBeenCalled()
        })

        it('usuario suspendido/inactivo', async () => {
            mockAuthenticatedSession(0)

            // para este test se modifico el limite de suspenciones a 2
            
            const jobsByUserId = await prisma.job.findMany({where:{userId:users[3].id}})
            
            await prisma.warning.createMany({data:{
                jobId:jobsByUserId[0].id,
                userId:users[3].id,
                reason:'inflige las normas'
            }})
           

            const res = await POST(makeRequest({reason:'inflige las normas'}, String(jobsByUserId[1].id)), { params: { id: jobsByUserId[1].id } })

            const user = await prisma.user.findUnique({where:{id:users[3].id}})

            expect(res.status).toBe(201)
            expect(mailService.sendAccountSuspendedEmail).toHaveBeenCalled()
            expect(user?.isActive).toBe(false)
           
        })
    })
})


afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
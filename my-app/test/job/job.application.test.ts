import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers } from "../fake.user"
import { POST } from "@/app/api/jobs/[id]/apply/route"
import { getJobs, loadJobs } from "../fakeJobs"
import { mailService } from "@/services/mail.service"

let users: any[]
let jobs: any[]

beforeEach(async () => {
    await prisma.application.deleteMany()
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

vi.mock('@/services/mail.service', ()=>({
    mailService:{
        sendApplicationEmail: vi.fn()
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

describe('POST /api/job/:id/apply', () => {
    describe('casos de postulacion', () => {
        it('postularse a un job finalizado o pausado', async () => {
            mockAuthenticatedSession(0)

            const res = await POST({ params: { id: String(jobs[3].id) } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('No es posible postularte en estos momentos.')

        })

        it('postularse a un job siendo el autor del mismo', async () => {
            mockAuthenticatedSession(0)

            const res = await POST({ params: { id: String(jobs[0].id) } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('No puedes postularte a tu misma publicación')

        })

        it('postularse a un job sin cv cargado', async () => {
            mockAuthenticatedSession(0)

            const res = await POST({ params: { id: String(jobs[1].id) } })
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Necesita cargar su cv')

        })

        it('postularse dos veces al mismo job', async () => {
            mockAuthenticatedSession(0)

            // cargo cv
            await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[0].id } })
            await POST({ params: { id: String(jobs[1].id) } })

            const res = await POST({ params: { id: String(jobs[1].id) } })

            const body = await res.json()

            expect(res.status).toBe(409)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Ya estás postulado a esta publicación')

        })

        it('postularse a un job con limite de aplicantes superado', async () => {
            // primera postulacion
            
            mockAuthenticatedSession(1)

            // modificamos limites del jobs[0]
            // ya que el limite es 50

            await prisma.job.update({ data: { applicationLimit: 1 }, where: { id: jobs[0].id } })

            // cargo cv
            await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[1].id } })

            
            await POST({ params: { id: String(jobs[0].id) } })

            // segunda postulacion 

            mockAuthenticatedSession(3)

            // cargo cv
            await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[3].id }})
            
            const res = await POST({ params: { id: String(jobs[0].id) } })
            const body = await res.json()
            console.log('body', body)
            expect(res.status).toBe(403)
            expect(body.error).toBe('No es posible postularte en estos momentos.')

        })
    })

    it('postularse a un job con exito', async () => {
        mockAuthenticatedSession(0)

        // cargo cv
        await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[0].id } })

        const res = await POST({ params: { id: String(jobs[1].id) } })
        const body = await res.json()

        expect(res.status).toBe(201)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
    })

    it('postulacion y envio de email', async () => {
         mockAuthenticatedSession(0)

        // cargo cv
        await prisma.user.update({ data: { cv: 'fakeCv.pdf' }, where: { id: users[0].id } })

        const res = await POST({ params: { id: String(jobs[1].id) } })
        const body = await res.json()

        expect(res.status).toBe(201)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
        expect(mailService.sendApplicationEmail).toHaveBeenCalled()
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
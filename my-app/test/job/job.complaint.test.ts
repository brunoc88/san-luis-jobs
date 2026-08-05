import { describe, it, beforeEach, afterAll, afterEach, vi, expect } from "vitest"
import { getServerSession } from "next-auth"
import { loadJobs, getJobs } from "../fakeJobs"
import { getUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { POST } from "@/app/api/jobs/[id]/complaint/route"

let users: any[]
let jobs: any[]

beforeEach(async () => {
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

const makeRequest = (data: any, id: string) => {
    return new Request(`http://localhost/api/job/${id}/complaint`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('POST /api/jobs/:id/complaint', () => {
    describe('validaciones zod', () => {
        it('tipo de denuncia incorrecta', async () => {
            mockAuthenticatedSession(0)

            const res = await POST(makeRequest({ reason: "xreason" }, jobs[1].id), { params: { id: jobs[1].id } })
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('reason')
            expect(body.error.reason).toContain('Denuncia inválida.')

        })

        it('other sin explicación', async () => {
            mockAuthenticatedSession(0)

            const res = await POST(
                makeRequest(
                    {
                        reason: "OTHER"
                    },
                    jobs[1].id
                ),
                { params: { id: jobs[1].id } }
            )

            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body.error.explanation).toContain("Debe especificar el motivo de la denuncia.")
        })

        it('other con explicación menor a 5 caracteres', async () => {
            mockAuthenticatedSession(0)

            const res = await POST(
                makeRequest(
                    {
                        reason: "OTHER",
                        explanation: 'abcd'
                    },
                    jobs[1].id
                ),
                { params: { id: jobs[1].id } }
            )

            const body = await res.json()

            console.log(body)

            expect(res.status).toBe(400)
            expect(body.error.explanation).toContain("Mínimo 5 caracteres.")
        })
    })

    describe('denuncia validad', () => {
        it('tipo != OTHER & explicacion', async () => {
            mockAuthenticatedSession(0)

            const res = await POST(makeRequest({ reason: "FALSE_INFORMATION", explanation: 'all is fake' }, jobs[1].id), { params: { id: jobs[1].id } })
            const body = await res.json()

            expect(res.status).toBe(201)
            expect(body).toHaveProperty('ok')
            expect(body.ok).toBe(true)

        })

        it('tipo != OTHER & sin explicacion', async () => {
            mockAuthenticatedSession(0)

            const res = await POST(makeRequest({ reason: "FALSE_INFORMATION" }, jobs[1].id), { params: { id: jobs[1].id } })
            const body = await res.json()

            expect(res.status).toBe(201)
            expect(body).toHaveProperty('ok')
            expect(body.ok).toBe(true)

        })
    })

    it('denuncia del mismo autor', async () => {

        mockAuthenticatedSession(0)

        const res = await POST(makeRequest({ reason: "FALSE_INFORMATION" }, jobs[0].id), { params: { id: jobs[0].id } })
        const body = await res.json()

        expect(res.status).toBe(403)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('No puedes denunciar tu propia publicación.')

    })

    it('duplicado de denuncia', async () => {

        mockAuthenticatedSession(0)

        await POST(makeRequest({ reason: "FALSE_INFORMATION" }, jobs[1].id), { params: { id: jobs[1].id } })

        const res = await POST(makeRequest({ reason: "FALSE_INFORMATION" }, jobs[1].id), { params: { id: jobs[1].id } })
        const body = await res.json()

        expect(res.status).toBe(409)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('Ya has denunciado esta publicación.')

    })
})


afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
import { prisma } from "@/lib/prisma"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { getUsers } from "../fake.user"
import { getServerSession } from "next-auth"
import { getJobs, loadJobs } from "../fakeJobs"
import { DELETE } from "@/app/api/complaints/[id]/route"

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

describe('DELETE /api/complaints/:id', () => {
    describe('Eliminaciones invalidas de complaint', () => {
        it('admin a admin', async () => {

            mockAuthenticatedSession(0)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[1].id,
                    jobId: jobs[0].id
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })

            expect(res.status).toBe(403)

        })

        it('mismo autor', async () => {

            mockAuthenticatedSession(0)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[0].id,
                    jobId: jobs[0].id
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('No puedes eliminar tu propia denuncia')

        })

        it('superAdmin a superAdmin', async () => {

            mockAuthenticatedSession(6)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[7].id,
                    jobId: jobs[0].id
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })

            expect(res.status).toBe(403)

        })

        it('admin a superAdmin', async () => {

            mockAuthenticatedSession(0)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[7].id,
                    jobId: jobs[0].id
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })

            expect(res.status).toBe(403)

        })

        it('complaint inexistente o inactiva', async () => {

            mockAuthenticatedSession(0)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[7].id,
                    jobId: jobs[0].id,
                    isActive:false
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })

            expect(res.status).toBe(404)

        })
    })

    describe('Eliminaciones validas', () => {
        it('admin a usuario comun', async () => {

            mockAuthenticatedSession(0)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[3].id,
                    jobId: jobs[0].id
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })
            const body = await res.json()

            const complaintAfter = await prisma.complaint.findUnique({where:{id:complaint.id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(complaintAfter?.isActive).toBe(false)

        })

        it('superAdmin a usuario comun', async () => {

            mockAuthenticatedSession(7)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[3].id,
                    jobId: jobs[0].id
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })
            const body = await res.json()

            const complaintAfter = await prisma.complaint.findUnique({where:{id:complaint.id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(complaintAfter?.isActive).toBe(false)

        })

        it('superAdmin a admin', async () => {

            mockAuthenticatedSession(7)

            const complaint = await prisma.complaint.create({
                data: {
                    reason: "FALSE_INFORMATION",
                    explanation: 'all is fake',
                    userId: users[0].id,
                    jobId: jobs[0].id
                }
            })

            const res = await DELETE({ params: { id: complaint.id } })
            const body = await res.json()

            const complaintAfter = await prisma.complaint.findUnique({where:{id:complaint.id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(complaintAfter?.isActive).toBe(false)

        })
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
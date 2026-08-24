import { prisma } from "@/lib/prisma"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { getUsers, loadUsers } from "../fake.user"
import { getServerSession } from "next-auth"
import { getJobs, loadJobs } from "../fakeJobs"
import { POST } from "@/app/api/jobs/[id]/complaint/route"
import { GET } from "@/app/api/complaints/[id]/route"

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



describe('GET /api/complaint/:id', () => {
    it('ver detalles de queja', async () => {
        mockAuthenticatedSession(0)

        // usuario hace una denuncia
        const complaint = await prisma.complaint.create({
            data: {
                reason: "FALSE_INFORMATION",
                explanation: 'all is fake',
                userId: users[1].id,
                jobId: jobs[0].id
            }
        })

        expect(complaint).not.toBeNull()
        expect(complaint).toHaveProperty('id')
        

        const res = await GET({ params: { id: complaint.id } })
        const body = await res.json()
        
        expect(body).not.toBeNull()
        expect(body).toHaveProperty('complaint')
        expect(body.complaint).toHaveProperty('jobAuthor')
        expect(body.complaint).toHaveProperty('reportedBy')
        expect(body.complaint.jobAuthor).toBe('admin1')
        expect(body.complaint.reportedBy).toBe('admin2')
        
    })
})


afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
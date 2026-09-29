import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { getUsers, loadUsers } from "../../fake.user"
import { POST } from "@/app/api/jobs/route"
import { getLocations, loadLocations } from "../../dummy.locations"
import clearTestDb from "../../clearTestDb"

let users: any[]
let locations: any[]

beforeEach(async () => {
    await clearTestDb()
    await loadUsers()
    await loadLocations()

    users = await getUsers()
    locations = await getLocations()
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

const makeRequest = (data: any) => {
    return new Request('http://localhost/api/job', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('POST rate-limit crear job', () => {
    it('limite de usuario', async () => {
        mockAuthenticatedSession(0)

        const job = {
            title: "Desarrollador Backend Node.js",
            description:
                "Buscamos un desarrollador backend con experiencia en Node.js, Express y PostgreSQL para trabajar en proyectos escalables.",
            salary: 1800000,
            applicationLimit: 50,
            modality: "remote",
            schedule: "fullTime",
            locationId: locations[0].id
        }

        for (let i = 0; i < 10; i++) {
            const res = await POST(makeRequest(job))
            expect(res.status).toBe(201)
        }

        const res = await POST(makeRequest(job))

        expect(res.status).toBe(429)

    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
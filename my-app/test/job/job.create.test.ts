import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { getLocations, loadLocations } from "../dummy.locations"
import { POST } from "@/app/api/jobs/route"

let users: any[]
let locations: any[]

beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.location.deleteMany()

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

describe('POST /api/job', () => {
    describe('validaciones zod', () => {
        it('falta titulo & descripcion', async () => {
            mockAuthenticatedSession(0)
            
            let job = {
                title:'',
                description:'',
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('title')
            expect(body.error).toHaveProperty('description')
            expect(body.error.title).toContain('Ingrese un título.')
            expect(body.error.description).toContain('Ingrese una descripción.')
        })
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
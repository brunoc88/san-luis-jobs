import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { getLocations, loadLocations } from "../dummy.locations"
import { GET } from "@/app/api/location/active/route"

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

describe('GET /api/location/active', () => {
    it('obtener todas las locations', async () => {
        mockAuthenticatedSession(0)

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('locations')
        expect(body.locations.length).not.toBe(0)

    })

    it('obtener todas las locations pero vacias', async () => {

        await prisma.location.deleteMany()

        mockAuthenticatedSession(0)

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('locations')
        expect(body.locations.length).toBe(0)

    })
})
afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
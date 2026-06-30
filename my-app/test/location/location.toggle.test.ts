import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { getLocations, loadLocations } from "../dummy.locations"
import { PATCH } from "@/app/api/location/[id]/toggle/route"

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

const makeRequest = (id: string) => {
    return new Request(`http://localhost/api/location/${id}/toggle`, {
        method: 'PATCH'
    })
}

describe('PATCH /api/location/:id', () => {
    it('activar location', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(makeRequest(String(locations[2].id)), { params: { id: String(locations[2].id) } })

        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('ok')
        expect(body).toHaveProperty('location')
        expect(body.location.isActive).toBe(true)

    })

    it('desactivar location', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(makeRequest(String(locations[0].id)), { params: { id: String(locations[0].id) } })

        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('ok')
        expect(body).toHaveProperty('location')
        expect(body.location.isActive).toBe(false)

    })

    it('activar location inexistente', async () => {
        mockAuthenticatedSession(0)

        const res = await PATCH(makeRequest(String(10)), { params: { id: String(10) } })

        const body = await res.json()

        expect(res.status).toBe(404)
        expect(body).toHaveProperty('error')

    })

})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
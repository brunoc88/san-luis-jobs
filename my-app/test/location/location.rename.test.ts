import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { getLocations, loadLocations } from "../dummy.locations"
import { PATCH } from "@/app/api/location/[id]/route"

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

const makeRequest = (id: string, data: { name: string }) => {
    return new Request(`http://localhost/api/location/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    })
}

describe('PATCH /api/location/:id', () => {
    it('validacion zod', async () => {
        mockAuthenticatedSession(6)

        const res = await PATCH(makeRequest(String(locations[0].id), { name: '' }), { params: { id: locations[0].id } })

        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body).toHaveProperty('error')
        expect(body.error).toHaveProperty('name')
        expect(body.error.name).toContain('debe ingresar locacion')
    })

    it('cabiar nombre con exito', async () => {
        mockAuthenticatedSession(6)
        
        const res = await PATCH(makeRequest(String(locations[0].id), { name: 'Juan Llerena' }), { params: { id: locations[0].id } })

        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('ok')
        expect(body.ok).toBe(true)
        expect(body).toHaveProperty('location')
        expect(body.location.name).toBe('juan llerena')
    })

    it('duplicado', async () => {
        mockAuthenticatedSession(6)
        console.log(locations[0].name)
        const res = await PATCH(makeRequest(String(locations[0].id), { name: 'san luis' }), { params: { id: locations[0].id } })
       
        expect(res.status).toBe(409)
        
    })
})


afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
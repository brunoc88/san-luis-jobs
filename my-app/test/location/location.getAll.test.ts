import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import {describe, it, beforeEach, afterEach, afterAll, vi, expect} from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { getLocations, loadLocations } from "../dummy.locations"
import { GET } from "@/app/api/location/route" 

let users: any[]
let locations : any []

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


describe('GET api/location', () => {
    it('sin sesion', async ()=>{
        const res = await GET()
        expect(res.status).toBe(401)
    })

    it('obtener location sin problemas', async () => {
        mockAuthenticatedSession(0)
        const res = await GET()
        const body = await res.json()
        
        expect(res.status).toBe(200)
        expect(body).not.toBeNull()
        expect(body).toHaveProperty('locations')
        expect(body.locations.length).not.toBe(0)
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
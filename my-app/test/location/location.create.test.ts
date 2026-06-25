import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { POST } from "@/app/api/location/route"


let users: any[]

beforeEach(async () => {
    await prisma.user.deleteMany()
    await loadUsers()
    users = await getUsers()
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

const makeRequest = (data: { name: string }) => {
    return new Request('http://localhost/api/location', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('POST /api/location', () => {
    it('sin sesion', async () => {

        (getServerSession as any).mockResolvedValue(null)

        const res = await POST(makeRequest({ name: 'san luis' }))
        const body = await res.json()

        expect(res.status).toBe(401)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('Sin autorizacion')
    })

    it('validacion zod', async () => {
        mockAuthenticatedSession(0)
        const res = await POST(makeRequest({ name: '' }))
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error.name).toContain('debe ingresar locacion')
    })

    describe('casos de usuario', () => {
        it('session activa pero usuario eliminado', async () => {
            mockAuthenticatedSession(0)

            await prisma.user.delete({ where: { id: users[0].id } })
            let user = await prisma.user.findUnique({ where: { id: users[0].id } })

            const res = await POST(makeRequest({ name: 'sl' }))

            expect(res.status).toBe(404)
            expect(user).toBeNull()

        })

        it('session activa pero usuario inactivo', async () => {
            mockAuthenticatedSession(0)

            await prisma.user.update({ data: { isActive: false }, where: { id: users[0].id } })

            const res = await POST(makeRequest({ name: 'sl' }))

            expect(res.status).toBe(403)

        })

        it('session activa pero rol common', async () => {
            mockAuthenticatedSession(3)

            await prisma.user.update({ data: { isActive: false }, where: { id: users[0].id } })

            const res = await POST(makeRequest({ name: 'sl' }))

            expect(res.status).toBe(403)

        })

    })

    it('crear location sin problemas', async () => {
        mockAuthenticatedSession(6)

        const res = await POST(makeRequest({name:'sl'}))
        
        expect(res.status).toBe(201)
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
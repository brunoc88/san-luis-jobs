import { vi, it, describe, beforeEach, afterEach, afterAll, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { loadUsers, getUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { PATCH } from "@/app/api/users/[id]/give-role/route"


let users: any[]

beforeEach(async () => {
    await clearTestDb()
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

const mackeRequest = async (userId: number) => {
    return await PATCH({ params: { id: userId } })
}

describe('PATCH /api/users/:id/give-role', () => {
    describe('asignaciones invalidas', () => {
       
        it('mismo usuario', async () => {
            mockAuthenticatedSession(6)

            const res = await mackeRequest(users[6].id)
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('No puedes cambiar tu propio rol')
        })

        it('mismo role', async () => {
            mockAuthenticatedSession(6)

            const res = await mackeRequest(users[7].id)
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('Accion invalida')
        })

        it('dar rol admin a cuenta inactiva', async () => {
            mockAuthenticatedSession(6)

            const res = await mackeRequest(users[5].id)
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('El usuario no cumple las condiciones')
        })

        it('dar rol admin a cuenta suspendida', async () => {
            mockAuthenticatedSession(6)

            // suspendemos una cuenta
            await prisma.user.update({data:{isSuspended:true}, where:{id:users[4].id}})

            const res = await mackeRequest(users[4].id)
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('El usuario no cumple las condiciones')
        })
    })

    it('dar role admin', async () => {

        mockAuthenticatedSession(6)

        const userBefore = users[3]
        
        const res = await mackeRequest(users[3].id)
        const body = await res.json()

        const userAfter = await prisma.user.findUnique({where:{id:users[3].id}})

        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(userBefore.role).toBe('common')
        expect(userAfter?.role).toBe('admin')

    })

    it('quitar role admin', async () => {

        mockAuthenticatedSession(6)

        const res = await mackeRequest(users[0].id)
        const body = await res.json()

        const user = await prisma.user.findUnique({where:{id:users[0].id}})

        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(user?.role).toBe('common')

    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
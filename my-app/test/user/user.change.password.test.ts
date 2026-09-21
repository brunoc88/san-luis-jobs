import { vi, beforeEach, afterEach, afterAll, describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { PATCH } from "@/app/api/users/me/password/route"
import { loadUsers, getUsers } from "../fake.user"
import clearTestDb from "../clearTestDb"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"

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

const mackeRequest = (data: { currentPassword: string, password: string, password2: string }) => {
    return new Request('http://localhost/api/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify(data)
    })
}



describe('PATCH /api/users/me/password', () => {
    it('validacion zod', async () => {

        mockAuthenticatedSession(0)
        const res = await PATCH(mackeRequest({ currentPassword: '', password: 'newsekretss', password2: 'newsekretss' }))

        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error).toHaveProperty('currentPassword')
        expect(body.error.currentPassword).toContain('debe ingresar un password')
    })

    it('password invalido', async () => {

        // actualizo el password porque es menor en caracteres
        const newPassword = await bcrypt.hash('sekretss', 10)
        await prisma.user.update({ data: { password: newPassword }, where: { id: users[0].id } })

        mockAuthenticatedSession(0)
        const res = await PATCH(mackeRequest({ currentPassword: 'abcdefghi', password: 'newsekretss', password2: 'newsekretss' }))

        const body = await res.json()
        
        expect(res.status).toBe(403)
        expect(body.error).toBe('password invalido')
    })

    it('cambio valido de password', async () => {

        // actualizo el password porque es menor en caracteres
        const newPassword = await bcrypt.hash('sekretss', 10)
        const userBefore = await prisma.user.update({ data: { password: newPassword }, where: { id: users[0].id } })

        mockAuthenticatedSession(0)

        const res = await PATCH(mackeRequest({ currentPassword: 'sekretss', password: 'newsekretss', password2: 'newsekretss' }))
        const body = await res.json()
        const userAfter = await prisma.user.findUnique({where:{id:users[0].id}})


        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(userAfter?.password).not.toBe(userBefore.password)
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
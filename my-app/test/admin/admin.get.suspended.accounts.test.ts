import { vi, it, describe, beforeEach, afterEach, afterAll, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { getUsers, loadUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { GET } from "@/app/api/users/suspended/route"
import { NextRequest } from "next/server"


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

const updateAccountsStatus = async () => {
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[0].id } })
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[1].id } })
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[2].id } })
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[3].id } })
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[4].id } })
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[5].id } })
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[7].id } })
    await prisma.user.update({ data: { isActive: false, isSuspended: true }, where: { id: users[8].id } })
}

describe('GET /api/users/suspended', () => {
    it('obtener listado default', async () => {
        mockAuthenticatedSession(6)

        // suspendemos algunas cuentas

        await updateAccountsStatus()
        const res = await GET(new NextRequest(`http://localhost/api/users/suspended`))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('accounts')
        expect(body.account).not.toBeNull()
    })

    it('obtener cuentas con filtrado', async () => {
        mockAuthenticatedSession(6)

        // suspendemos algunas cuentas

        await updateAccountsStatus()
        const res = await GET(new NextRequest(`http://localhost/api/users/suspended?search=c`))
        const body = await res.json()
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('accounts')
        expect(body.account).not.toBeNull()
    })

    it('paginacion', async () => {
        mockAuthenticatedSession(6)

        // suspendemos algunas cuentas

        await updateAccountsStatus()

        const res = await GET(new NextRequest(`http://localhost/api/users/suspended?page=2`))
        const body = await res.json()
       
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('accounts')
        expect(body.account).not.toBeNull()
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
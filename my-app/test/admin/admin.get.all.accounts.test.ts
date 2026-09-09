import { vi, it, describe, beforeEach, afterEach, afterAll, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { getUsers, loadUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { GET } from "@/app/api/users/route"
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
    await prisma.user.update({ data: { isActive: false }, where: { id: users[1].id } })
    await prisma.user.update({ data: { isActive: false }, where: { id: users[2].id } })
    await prisma.user.update({ data: { isActive: false}, where: { id: users[5].id } })
}

describe('GET /api/users', () => {
    it('listado siendo superAdmin', async () => {
        mockAuthenticatedSession(6)

        await updateAccountsStatus()

        const res = await GET(new NextRequest(`http://localhost/api/users`))
        const body = await res.json()
        
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('accounts')
        expect(body.accounts).not.toBeNull()
        expect(body.accounts.length).toBe(5)
        
    })

    it('listado siendo admin', async () => {
        mockAuthenticatedSession(0)

        await updateAccountsStatus()

        const res = await GET(new NextRequest(`http://localhost/api/users`))
        const body = await res.json()
        
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('accounts')
        expect(body.accounts).not.toBeNull()
        expect(body.accounts.length).toBe(3)
        
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
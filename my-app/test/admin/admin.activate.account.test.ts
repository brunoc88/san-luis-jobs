import { vi, it, describe, beforeEach, afterEach, afterAll, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { getUsers, loadUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { PATCH } from "@/app/api/users/[id]/activate/route"
import { mailService } from "@/services/mail.service"

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

describe('PATCH /api/users/:id/activate', ()=>{
    describe('casos invalidos', () =>{
        it('activar cuenta suspendida', async () =>{
            mockAuthenticatedSession(0)

            //editamos una cuenta 
            await prisma.user.update({data:{isActive:false, isSuspended:true},where:{id:users[3].id}})

            const res = await mackeRequest(users[3].id)
            const body = await res.json()
            
            expect(res.status).toBe(403)
            expect(body.error).toBe('Accion invalida: Cuenta suspendida')
        })

        it('activar cuenta ya activa', async () =>{
            mockAuthenticatedSession(0)

            const res = await mackeRequest(users[3].id)
            const body = await res.json()
            
            expect(res.status).toBe(403)
            expect(body.error).toBe('La cuenta ya esta activa!')
        })

        it('activar cuenta superAdmin siendo admin', async () =>{
            mockAuthenticatedSession(0)

            const res = await mackeRequest(users[7].id)

            expect(res.status).toBe(403)
        })

        it('activar cuenta superAdmin siendo superAdmin', async () =>{
            mockAuthenticatedSession(6)

            const res = await mackeRequest(users[7].id)
            
            expect(res.status).toBe(403)
        })
    })

    describe('casos validos', () => {
        it('activar cuenta comun siendo admin', async () =>{
            mockAuthenticatedSession(0)

            const userBefore = users[5]

            const res = await mackeRequest(users[5].id)
            const body = await res.json()

            const userAfter = await prisma.user.findUnique({where:{id:users[5].id}})

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body.ok).toBe(true)
            expect(userBefore?.isActive).toBe(false)
            expect(userAfter?.isActive).toBe(true)
        })

        it('activar cuenta admin siendo admin', async () =>{
            mockAuthenticatedSession(0)

            const userBefore = users[2]

            const res = await mackeRequest(users[2].id)
            const body = await res.json()

            const userAfter = await prisma.user.findUnique({where:{id:users[2].id}})

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('ok')
            expect(body.ok).toBe(true)
            expect(userBefore?.isActive).toBe(false)
            expect(userAfter?.isActive).toBe(true)
        })
    })
})
afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
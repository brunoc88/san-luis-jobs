import { vi, it, describe, beforeEach, afterEach, afterAll, expect } from "vitest"
import clearTestDb from "../clearTestDb"
import { loadUsers, getUsers } from "../fake.user"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { POST } from "@/app/api/jobs/[id]/suspend/route"
import { GET } from "@/app/api/users/[id]/suspension-audit/route"
import { loadJobs } from "../fakeJobs"


let users: any[]

beforeEach(async () => {
    await clearTestDb()
    await loadJobs()
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

const makeRequest = (data: any, id: string) => {
    return new Request(`http://localhost/api/job/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('GET /api/users/:id/suspension-audit', () => {
    it('obtener listado', async () => {
        mockAuthenticatedSession(6)
        // modificamos el service de suspension 
        // asi solo suspendemos 2 publicaciones

        // obtengo los jobs del usuario 3
        // el un rol comun por lo que es mas facil que lo suspendan

        const jobsByUserId = await prisma.job.findMany({ where: { userId: users[3].id } })

        // le creamos dos suspensiones
        await prisma.warning.createMany({
            data: {
                jobId: jobsByUserId[0].id,
                userId: users[3].id,
                reason: 'inflige las normas',
                adminId: users[0].id
            }
        })


        await POST(makeRequest({ reason: 'inflige las normas' }, String(jobsByUserId[1].id)), { params: { id: jobsByUserId[1].id } })

        // llamo para obtener listado
        const res = await GET({ params: { id: users[3].id } })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('audit')

    })

    it('ver auditoria de otro superAdmin', async () => {
        mockAuthenticatedSession(6)
    

        // modificamos su role a superAdmin

        await prisma.user.update({data:{role:'superAdmin'}, where:{id:users[3].id}})
       

        // llamo para obtener listado
        const res = await GET({ params: { id: users[3].id } })
        const body = await res.json()

        expect(res.status).toBe(403)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('No puedes ver esta auditoría')
    })

    it('ver auditoria de usuario no suspendido', async () => {
        mockAuthenticatedSession(6)


        // llamo para obtener listado
        const res = await GET({ params: { id: users[3].id } })
        const body = await res.json()

        expect(res.status).toBe(403)
        expect(body).toHaveProperty('error')
        expect(body.error).toBe('El usuario no cuenta con suspension')
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
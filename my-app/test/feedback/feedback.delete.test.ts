import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import clearTestDb from "../clearTestDb"
import { DELETE } from "@/app/api/feedback/[id]/route"

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

describe('DELETE /api/feedback/:id', () => {
    describe('intentos de borrado', () => {
        it('mismo autor admin', async () => {
            mockAuthenticatedSession(0)

            const feeback = await prisma.feedback.create({
                data: {
                    opinion: 'Muy buen sitio para buscar empleo en la provincia',
                    userId: users[0].id
                }
            })

            const res = await DELETE({ params: { id: feeback.id } })
            const body = await res.json()

            expect(res.status).toBe(403)
            expect(body.error).toBe('No puedes eliminar tu propia publicacion')
        })

        it('admin a superAdmin', async () => {
            mockAuthenticatedSession(0)

            const feeback = await prisma.feedback.create({
                data: {
                    opinion: 'Muy buen sitio para buscar empleo en la provincia',
                    userId: users[6].id
                }
            })

            const res = await DELETE({ params: { id: feeback.id } })

            expect(res.status).toBe(403)
        })

        it('admin a admin', async () => {
            mockAuthenticatedSession(0)

            const feeback = await prisma.feedback.create({
                data: {
                    opinion: 'Muy buen sitio para buscar empleo en la provincia',
                    userId: users[1].id
                }
            })

            const res = await DELETE({ params: { id: feeback.id } })
            const body = await res.json()

            const feedbackData = await prisma.feedback.findUnique({where:{id:feeback.id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(feedbackData).toBeNull()

        })

        it('superAdmin a superAdmin', async () => {
            mockAuthenticatedSession(6)

            const feeback = await prisma.feedback.create({
                data: {
                    opinion: 'Muy buen sitio para buscar empleo en la provincia',
                    userId: users[7].id
                }
            })

            const res = await DELETE({ params: { id: feeback.id } })
            const body = await res.json()

            const feedbackData = await prisma.feedback.findUnique({where:{id:feeback.id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(feedbackData).toBeNull()

        })

        it('admin a usuario comun', async () => {
            mockAuthenticatedSession(0)

            const feeback = await prisma.feedback.create({
                data: {
                    opinion: 'Muy buen sitio para buscar empleo en la provincia',
                    userId: users[3].id
                }
            })

            const res = await DELETE({ params: { id: feeback.id } })
            const body = await res.json()

            const feedbackData = await prisma.feedback.findUnique({where:{id:feeback.id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(feedbackData).toBeNull()

        })
    })

})
afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
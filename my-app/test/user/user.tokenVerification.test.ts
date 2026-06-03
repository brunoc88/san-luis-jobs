import { it, describe, beforeEach, afterAll, vi, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { GET } from "@/app/api/users/confirm/route"
import { POST } from "@/app/api/users/route"

let capturedToken = ""

beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany()
    await prisma.user.deleteMany()
    capturedToken = ""
})



vi.mock("@/services/mail.service", () => ({
    mailService: {
        sendEmailVerification: vi.fn(
            async (_email: string, token: string) => {
                capturedToken = token
            }
        )
    }
}))

const makeRequest = (token: string | null) => {
    return new Request(
        `http://localhost/api/user/confirm?token=${token}`,
        { method: 'GET' }
    )
}

describe('api/user/confirm', () => {
    describe('crear cuenta y confirmar con token', () => {
        it('falta token', async () => {
            const res = await GET(makeRequest(''))
            const body = await res?.json()

            expect(res?.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Token requerido')
        })

        it('token inválido', async () => {
            const res = await GET(makeRequest('12345'))
            const body = await res?.json()

            expect(res?.status).toBe(404)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Token inválido')
        })

        it('token expirado', async () => {

            const formData = new FormData()

            formData.append('email', 'bruno5@gmail.com')
            formData.append('username', 'bruno5')
            formData.append('password', 'sekretsx')
            formData.append('password2', 'sekretsx')
            formData.append('description', '')

            const res = await POST(new Request('http://localhost/api/user', {
                method: 'POST',
                body: formData
            }))

            expect(res.status).toBe(201)

            const user = await prisma.user.findFirst()

            // actualizo token poniendo fecha de vencimiento restandole 1
            const userToken = await prisma.emailVerificationToken.update({
                where: {
                    userId: user!.id
                },
                data: {
                    expiresAt: new Date(Date.now() - 1000)
                }
            })


            const res2 = await GET(makeRequest(capturedToken))
            const body = await res2.json()

            console.log(res2.status)
            console.log(body)

            expect(res2.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Token expirado')
        })

        it('usuario ya activo', async () => {
            const formData = new FormData()

            formData.append('email', 'bruno6@test.com')
            formData.append('username', 'bruno6')
            formData.append('password', 'sekretsx')
            formData.append('password2', 'sekretsx')
            formData.append('description', '')

            const res = await POST(new Request('http://localhost/api/user', {
                method: 'POST',
                body: formData
            }))

            expect(res.status).toBe(201)

            // busco usuario creado
            const user = await prisma.user.findFirst()


            // activo usuario
            await prisma.user.update({ data: { isActive: true }, where: { id: user?.id } })

            const res2 = await GET(makeRequest(String(capturedToken)))
            const body = await res2.json()

            expect(res2.status).toBe(400)
            expect(body.error).toBe('cuenta ya activa')
        })

        it('confirmacion y eliminacion de token', async () => {
            const formData = new FormData()

            formData.append('email', 'bruno7@test.com')
            formData.append('username', 'bruno7')
            formData.append('password', 'sekretsx')
            formData.append('password2', 'sekretsx')
            formData.append('description', '')

            const res = await POST(new Request('http://localhost/api/user', {
                method: 'POST',
                body: formData
            }))

            expect(res.status).toBe(201)

        
            const res2 = await GET(makeRequest((capturedToken)))
            const body = await res2.json()

            const userTokenAfter = await prisma.emailVerificationToken.findFirst()

            expect(res2.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(userTokenAfter).toBeNull()
        })

    })
})

afterAll(async () => {
    await prisma.$disconnect()
})
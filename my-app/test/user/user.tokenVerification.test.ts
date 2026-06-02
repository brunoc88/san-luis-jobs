import { it, describe, beforeEach, afterAll, vi, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { GET } from "@/app/api/users/confirm/route"
import { POST } from "@/app/api/users/route"

beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.emailVerificationToken.deleteMany()
})

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

            formData.append('email', 'brunoc@gmail.com')
            formData.append('username', 'brunoc88')
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

           
            const res2 = await GET(makeRequest(userToken.token))
            const body = await res2.json()

            expect(res2.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toBe('Token expirado')
        })

        it('usuario ya activo', async() => {
            const formData = new FormData()

            formData.append('email', 'brunoc@gmail.com')
            formData.append('username', 'brunoc88')
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

            // guardo token 
            const userToken = await prisma.emailVerificationToken.findUnique({where:{userId:user?.id}})

            // activo usuario
            await prisma.user.update({data:{isActive:true},where:{id:user?.id}})

            const res2 = await GET(makeRequest(String(userToken?.token)))
            const body = await res2.json()

            expect(res2.status).toBe(400)
            expect(body.error).toBe('cuenta ya activa')
        })

        it('confirmacion y eliminacion de token', async() => {
            const formData = new FormData()

            formData.append('email', 'brunoc@gmail.com')
            formData.append('username', 'brunoc88')
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

            // guardo token 
            const userToken = await prisma.emailVerificationToken.findUnique({where:{userId:user?.id}})


            const res2 = await GET(makeRequest((userToken!.token)))
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
import { vi, describe, it, beforeEach, afterAll, expect } from "vitest"
import { GET } from "@/app/api/auth/reset-password/route"
import { prisma } from "@/lib/prisma"
import { afterEach } from "node:test"
import { mailService } from "@/services/mail.service"
import { POST as forgotPasswordPOST } from "@/app/api/auth/forgot-password/route"
import { POST } from "@/app/api/auth/reset-password/route"
import { authService } from "@/services/auth.service"
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"



let capturedToken = ""

beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany()
    await prisma.user.deleteMany()
    capturedToken = ""
})

vi.mock('@/services/mail.service', () => ({
    mailService: {
        sendEmailPasswordRecovery: vi.fn(
            async (email: string, token: string) => {
                capturedToken = token
            }
        ),
        sendPasswordChangedEmail: vi.fn()
    }
}))
/*
// descomentar si queremos comprovar que no es llamado
vi.mock('@/services/auth.service', () => ({
    authService:{
        resetPassword: vi.fn()
    }
}))*/



const makeRequest = (data: { token: string, password: string, password2: string }) => {
    return new Request(`http://localhost/api/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('POST /api/auth/reset-password', () => {
    describe('validaciones zod', () => {
        it('token vacio', async () => {
            const data = {
                token: '',
                password: 'sekretss',
                password2: 'sekretss'
            }

            const res = await POST(makeRequest(data))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('token')
            expect(body.error.token).toContain('token vacio')
            //expect(authService.resetPassword).not.toHaveBeenCalled()
        })

        it('passwords no coinciden', async () => {
            const data = {
                token: '123123',
                password: 'sekretss',
                password2: 'answerss'
            }

            const res = await POST(makeRequest(data))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('password2')
            expect(body.error.password2).toContain('Las contraseñas no coinciden')
            //expect(authService.resetPassword).not.toHaveBeenCalled()

        })
    })

    describe('tokens e usuarios cases', () => {
        it('token invalido', async () => {
            let data = {
                token: '123456',
                password: 'sekretss',
                password2: 'sekretss'
            }

            const res = await POST(makeRequest(data))
            const body = await res.json()

            expect(res.status).toBe(404)
            expect(body.error).toBe('Token inválido')

        })

        it('usuario inactivo', async () => {
            // creo usuario y lo activamos
            await prisma.user.create({
                data: {
                    email: 'fkuser@test.com',
                    username: 'fkuser',
                    password: 'sekretss',
                    isActive: true,
                    pic: 'fake.png'
                }
            })

            // solicito reset de password

            const res = await forgotPasswordPOST(new Request('http://localhost/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: 'fkuser@test.com' })
            }))

            expect(res.status).toBe(200)
            expect(mailService.sendEmailPasswordRecovery).toHaveBeenCalled()

            // desactivo al usuario
            await prisma.user.update({data:{isActive:false},where:{email:'fkuser@test.com'}})

            // mando token y password

            let data = {
            token: capturedToken,
            password: 'answerss',
            password2: 'answerss',
        }

        const res2 = await POST(makeRequest(data))
        const body = await res2.json()

        expect(res2.status).toBe(400)
        expect(body.error).toBe('cuenta inactiva')

        })
    })

    it('ejecucion correcta', async () => {
        // creo usuario y lo activamos
        await prisma.user.create({
            data: {
                email: 'fkuser@test.com',
                username: 'fkuser',
                password: 'sekretss',
                isActive: true,
                pic: 'fake.png'
            }
        })

        // solicito reset de password

        const res = await forgotPasswordPOST(new Request('http://localhost/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email: 'fkuser@test.com' })
        }))

        expect(res.status).toBe(200)
        expect(mailService.sendEmailPasswordRecovery).toHaveBeenCalled()


        // confimamos que se abrio el email y token valido
        const res2 = await GET(new Request(`http://localhost/api/auth/reset-password?token=${capturedToken}`, {
            method: 'GET'
        }))

        //busco user para obtener id
        let user = await prisma.user.findUnique({ where: { email: 'fkuser@test.com' } })

        expect(user).not.toBeNull()

        let tokenDB = await verificationTokenRepo.findTokenByUserId(user?.id)

        expect(tokenDB).not.toBeNull()

        expect(res2.status).toBe(200)


        // finalizamos mandando el token y password
        // ambos son enviados por formulario

        let data = {
            token: capturedToken,
            password: 'answerss',
            password2: 'answerss',
        }

        const res3 = await POST(makeRequest(data))


        // busco el token para ver que se elimino de la db

        const tokenAF = await verificationTokenRepo.findByToken(tokenDB?.token)

        expect(res3.status).toBe(200)
        expect(tokenAF).toBeNull()

    })
})
afterEach(() => {
    vi.clearAllMocks()
})

afterAll(async () => {
    prisma.$disconnect()
})

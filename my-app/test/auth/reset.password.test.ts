import { vi, describe, it, beforeEach, afterAll, expect } from "vitest"
import {GET} from "@/app/api/auth/reset-password/route"
import { prisma } from "@/lib/prisma"
import { afterEach } from "node:test"
import { mailService } from "@/services/mail.service"
import { POST } from "@/app/api/auth/forgot-password/route"

let capturedToken = ""

beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany()
    await prisma.user.deleteMany()
    capturedToken = ""
})

vi.mock('@/services/mail.service', () => ({
    mailService: {
        sendEmailPasswordRecovery: vi.fn(
            async (email:string, token:string) => {
                capturedToken = token
            }
        )
    }
}))



const makeRequest = (token:string) => {
    return new Request(`http://localhost/api/auth/reset-password?token=${token}`, {
        method: 'GET'
    })
}

describe('GET /api/auth/reset-password', () => {
    it('token null', async () => {
        const res = await GET(makeRequest(''))

        expect(res.status).toBe(400)
    })

    it('token invalido', async () => {
        const res = await GET(makeRequest('123123'))

        expect(res.status).toBe(404)
    })

    it('token valido', async () => {

        // creo usuario 
        await prisma.user.create({data:{
                email:'fkuser1@test.com',
                username:'fkuser1',
                password:'sekrets',
                pic:'fake.png',
                isActive:true
            }})

        // solicito cambiar password 
        await POST(new Request('http://localhost/api/auth/forgot-password',{
            method:'POST',
            body: JSON.stringify({email:'fkuser1@test.com'})
        }))

        expect(mailService.sendEmailPasswordRecovery).toHaveBeenCalled()
        expect(capturedToken).not.toBeNull()

       

        const res = await GET(makeRequest(capturedToken))
        const body = await res.json()


        expect(res.status).toBe(200)
        expect(body).not.toBeNull()
        expect(body).toHaveProperty('ok')
        expect(body).toHaveProperty('valid')
        expect(body.valid).toBe(true)
    })
})

afterEach(()=>{
    vi.clearAllMocks()
})

afterAll(async () => {
    prisma.$disconnect()
})

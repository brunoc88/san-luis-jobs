import { it, describe, beforeEach, afterAll, vi, expect } from "vitest"
//import { prisma } from '@/lib/prisma'
import { POST } from "@/app/api/users/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()



beforeEach(async () => {
    process.env.DEFAULT_USER_IMAGE_URL = "https://res.cloudinary.com/fake/default.png"
    //await prisma.user.deleteMany()
})

const makeRequest = (formData: FormData) => {
    return new Request('http://localhost/api/user', {
        method: 'POST',
        body: formData
    })
}

//  Mockear Cloudinary
vi.mock("@/lib/cloudinary", () => {
  return {
    uploadImage: vi.fn(async (file: File, folder: string) => {
      return {
        url: "https://res.cloudinary.com/fake/image.png",
        publicId: "users/fake-id"
      }
    }),
    deleteImage: vi.fn(async (publicId: string) => {
      return
    })
  }
})

describe('POST /api/user', ()=>{
    describe('Validation tests', ()=>{
        it('Falta email, username, password, password2', async ()=>{
            const formData = new FormData()

            formData.append('email','')
            formData.append('username','')
            formData.append('password','')
            formData.append('password','')

            const res = await POST(makeRequest(formData))
            const body = await res.json()
            

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('email')
            expect(body.error).toHaveProperty('username')
            expect(body.error).toHaveProperty('password')
            expect(body.error).toHaveProperty('password2')

            expect(body.error.email).toContain('email invalido')
            expect(body.error.email).toContain('debe ingresar un email')

        })
    })
})



afterAll(async ()=>{
    await prisma.$disconnect()
})
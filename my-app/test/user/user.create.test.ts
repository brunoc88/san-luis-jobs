import { it, describe, beforeEach, afterAll, vi, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { POST } from "@/app/api/users/route"
import { PrismaClient } from '@prisma/client'
import path from "path"
import fs from "fs"
import bcrypt from "bcryptjs"


beforeEach(async () => {
  process.env.DEFAULT_USER_IMAGE_URL = "https://res.cloudinary.com/fake/default.png"
  await prisma.user.deleteMany()
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

describe('POST /api/user', () => {
  describe('Test de validaciones zod', () => {
    it('Falta email, username, password, password2', async () => {
      const formData = new FormData()

      formData.append('email', '')
      formData.append('username', '')
      formData.append('password', '')
      formData.append('password2', '')

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

    it('Maximo de caracteres e email invalido', async () => {
      const formData = new FormData()

      formData.append('email', 'brunoc88')
      formData.append('username', 'bru')
      formData.append('password', '1234567')
      formData.append('password2', '1234567')
      formData.append('description', 'Soy una persona apasionada por la tecnología, la programación y el aprendizaje continuo. Me gusta desarrollar proyectos innovadores, resolver problemas complejos y mantenerme actualizado sobre las últimas tendencias digitales y herramientas de software. Tiene 228 caracteres')

      const res = await POST(makeRequest(formData))
      const body = await res.json()


      expect(res.status).toBe(400)
      expect(body).toHaveProperty('error')

      expect(body.error).toHaveProperty('email')
      expect(body.error).toHaveProperty('password')
      expect(body.error).toHaveProperty('password2')
      expect(body.error).toHaveProperty('description')
      expect(body.error).toHaveProperty('username')

      expect(body.error.email).toContain('email invalido')
      expect(body.error.password).toContain('minimo 8 caracteres')
      expect(body.error.password2).toContain('minimo 8 caracteres')
      expect(body.error.description).toContain('max 150 caracteres')
      expect(body.error.username).toContain('min 5 caracteres')

    })

    it('password & password de confirmacion no coinciden', async () => {
      const formData = new FormData()

      formData.append('password', '12345678')
      formData.append('password2', '123456789')

      const res = await POST(makeRequest(formData))
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body).toHaveProperty('error')
      expect(body.error).toHaveProperty('password2')
      expect(body.error.password2).toContain('Las contraseñas no coinciden')

    })
  })

  describe('Crear cuenta', () => {
    it('cuenta sin imagen', async () => {

      const formData = new FormData()

      formData.append('email', 'brunoc88@gmail.com')
      formData.append('username', 'brunoc88')
      formData.append('password', 'sekretsx')
      formData.append('password2', 'sekretsx')
      formData.append('description', 'programador fulltack - backend oriented')

      const res = await POST(makeRequest(formData))
      const body = await res.json()

      expect(res.status).toBe(201)

      expect(body).not.toBeNull()
      expect(body).toHaveProperty('ok')
    })

    it('cuenta con imagen', async () => {

      const formData = new FormData()

      formData.append('email', 'brunoc88@gmail.com')
      formData.append('username', 'brunoc88')
      formData.append('password', 'sekretsx')
      formData.append('password2', 'sekretsx')
      formData.append('description', '')

      // imagen desde fixtures
      const filePath = path.resolve(__dirname, "../fixtures/default.png")
      const buffer = fs.readFileSync(filePath)
      const file = new File([buffer], "default.png", { type: "image/png" })
      formData.append("file", file)
      
      const res = await POST(makeRequest(formData))
      const body = await res.json()

      expect(res.status).toBe(201)

      expect(body).not.toBeNull()
      expect(body).toHaveProperty('ok')
    })

    it('crear cuenta con duplicado de email', async () =>{
      const hashedPassword = await bcrypt.hash('sekrets', 10)
      await prisma.user.create({data:{
        email: 'brunoc88@gmail.com',
        username: 'brunoc88',
        password:hashedPassword,
        description:'sin description',
        pic:'fake.png',
        picPublicId:''
      }})

      const formData = new FormData()

      formData.append('email', 'brunoc88@gmail.com')
      formData.append('username', 'brunoc88')
      formData.append('password', 'sekretsx')
      formData.append('password2', 'sekretsx')
      formData.append('description', 'intentando duplicar cuenta')

      const res = await POST(makeRequest(formData))
      const body = await res.json()
      
      expect(res.status).toBe(409)
      expect(body).toHaveProperty('error')
      expect(body.error).toBe('El campo email ya está en uso')
    })
  })
})



afterAll(async () => {
  await prisma.$disconnect()
})
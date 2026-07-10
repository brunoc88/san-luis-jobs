import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { describe, it, beforeEach, afterEach, afterAll, vi, expect } from "vitest"
import { getUsers, loadUsers } from "../fake.user"
import { getLocations, loadLocations } from "../dummy.locations"
import { POST } from "@/app/api/jobs/route"

let users: any[]
let locations: any[]

beforeEach(async () => {
    await prisma.job.deleteMany()
    await prisma.user.deleteMany()
    await prisma.location.deleteMany()

    await loadUsers()
    await loadLocations()

    users = await getUsers()
    locations = await getLocations()
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

const makeRequest = (data: any) => {
    return new Request('http://localhost/api/job', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

describe('POST /api/job', () => {
    describe('validaciones zod', () => {
        it('falta titulo & descripcion', async () => {
            mockAuthenticatedSession(0)

            let job = {
                title: '',
                description: '',
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('title')
            expect(body.error).toHaveProperty('description')
            expect(body.error.title).toContain('Ingrese un título.')
            expect(body.error.description).toContain('Ingrese una descripción.')
        })

        it('min caracteres', async () => {
            mockAuthenticatedSession(0)

            let job = {
                title: 'tecnico',
                description: 'busco tecnico',
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('title')
            expect(body.error).toHaveProperty('description')
            expect(body.error.title).toContain('El título debe tener al menos 10 caracteres.')
            expect(body.error.description).toContain('La descripción debe tener al menos 30 caracteres.')
        })

        it('salary & applicationLimit, location con letras', async () => {
            mockAuthenticatedSession(0)

            let job = {
                salary: 'aeiou',
                applicationLimit: 'aeiou',
                locationId: 'aeiou'
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('applicationLimit')
            expect(body.error).toHaveProperty('salary')
            expect(body.error).toHaveProperty('locationId')
            expect(body.error.salary).toContain('debe ingresar un numero')
            expect(body.error.applicationLimit).toContain('debe ingresar un numero')
            expect(body.error.locationId).toContain('debe ingresar un numero')
        })

        it('modality & schedule invalidos', async () => {
            mockAuthenticatedSession(0)

            let job = {
                modality: 'remota',
                schedule: 'tiempo completo'
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('modality')
            expect(body.error).toHaveProperty('schedule')
            expect(body.error.modality).toContain('Modalidad inválida.')
            expect(body.error.schedule).toContain('Jornada inválida.')
        })
    })

    it('location inactiva o inexistente', async () => {
        mockAuthenticatedSession(0)

        const job = {
            title: "Desarrollador Backend Node.js",
            description:
                "Buscamos un desarrollador backend con experiencia en Node.js, Express y PostgreSQL para trabajar en proyectos escalables.",
            salary: 1800000,
            applicationLimit: 50,
            modality: "remote",
            schedule: "fullTime",
            locationId: 1
        }

        const res = await POST(makeRequest(job))
        const body = await res.json()

        expect(res.status).toBe(404)
        expect(body.error).toBe('Recurso no encontrado')
    })

    describe('crear job correctamente', () => {
        it('con salary & applicationLimit', async () => {
            mockAuthenticatedSession(0)

            const job = {
                title: "Desarrollador Backend Node.js",
                description:
                    "Buscamos un desarrollador backend con experiencia en Node.js, Express y PostgreSQL para trabajar en proyectos escalables.",
                salary: 1800000,
                applicationLimit: 50,
                modality: "remote",
                schedule: "fullTime",
                locationId: locations[0].id
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()
            console.log('job', body)
            expect(res.status).toBe(201)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('jobId')
            expect(body.ok).toBe(true)
            expect(body.jobId).not.toBeNull()
        })

        it('sin salary & applicationLimit', async () => {
            mockAuthenticatedSession(0)

            const job = {
                title: "Desarrollador Backend Node.js",
                description:
                    "Buscamos un desarrollador backend con experiencia en Node.js, Express y PostgreSQL para trabajar en proyectos escalables.",
                modality: "remote",
                schedule: "fullTime",
                locationId: locations[0].id
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()
            
            expect(res.status).toBe(201)
            expect(body).toHaveProperty('ok')
            expect(body).toHaveProperty('jobId')
            expect(body.ok).toBe(true)
            expect(body.jobId).not.toBeNull()
        })
    })

    it('enum diferente', async () => {
            mockAuthenticatedSession(0)

            const job = {
                title: "Desarrollador Backend Node.js",
                description:
                    "Buscamos un desarrollador backend con experiencia en Node.js, Express y PostgreSQL para trabajar en proyectos escalables.",
                modality: "presencial",
                schedule: "fullTime",
                locationId: locations[0].id
            }

            const res = await POST(makeRequest(job))
            const body = await res.json()
            
            expect(res.status).toBe(400)
            expect(body.error.modality).toContain('Modalidad inválida.')
           
        })

})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
import { vi, beforeEach, afterEach, afterAll, describe, it, expect } from "vitest"
import { PUT } from "@/app/api/jobs/[id]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import clearTestDb from "../clearTestDb"
import { getJobs, loadJobs } from "../fakeJobs"
import { getUsers } from "../fake.user"
import { applicationRepo } from "@/repositories/application.repository"
import { getLocations } from "../dummy.locations"

let users: any[]
let jobs: any[]
let locations: any[]

beforeEach(async () => {
    await clearTestDb()
    await loadJobs()
    users = await getUsers()
    jobs = await getJobs()
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

const makeRequest = (data: any, id: number) => {
    return new Request(`http://localhost/api/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
}

const createApplications = async (
    jobId: number,
    userIds: number[]
) => {
    for (const userId of userIds) {
        await applicationRepo.create(jobId, userId)
    }
}

describe('PUT /api/jobs/:id', () => {
    describe('validaciones de service', () => {
        it('Modificar trabajo no siendo el autor', async () => {
            mockAuthenticatedSession(1)
            const data = jobs[0]
            const res = await PUT(makeRequest(data, jobs[0].id), { params: { id: jobs[0].id } })

            expect(res.status).toBe(403)
        })

        it('Modificar el limite de aplicantes a uno menor en job state:active', async () => {
            mockAuthenticatedSession(0)
            //postulantes 10/50
            await createApplications(
                jobs[0].id,
                users.slice(1, 11).map(user => user.id)
            )

            const data = jobs[0]
            //modificamos a 5
            data.applicationLimit = 5

            const res = await PUT(makeRequest(data, jobs[0].id), { params: { id: jobs[0].id } })
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body.error).toBe("El límite de postulantes no puede ser menor o igual a la cantidad de postulantes actuales.")
        })
    })


    describe('editar job en cualquier estado', () => {

        it('Sacar limite de aplicantes', async () => {
            mockAuthenticatedSession(0)
            //postulantes 10/50
            await createApplications(
                jobs[0].id,
                users.slice(1, 11).map(user => user.id)
            )

            const { applicationLimit, ...rest } = jobs[0]
            const data = rest
            //modificamos: no mandamos el camplo applicationLimit
            //eso es porque el usuario decidio quitar el limite


            const res = await PUT(makeRequest(data, jobs[0].id), { params: { id: jobs[0].id } })
            const jobData = await prisma.job.findUnique({ where: { id: jobs[0].id } })



            expect(res.status).toBe(200)
            expect(jobs[0].applicationLimit).not.toBeNull()
            expect(jobs[0].applicationLimit).toBe(50)
            expect(jobData?.applicationLimit).toBe(null)

        })

        it('cambiar nombre, descripcion, locacion, salario, schedule, modality', async () => {
            mockAuthenticatedSession(0)

            const data = {
                title: 'Frontend jr',
                description: 'buscamos dev frontend junior que use react',
                salary: 9999,
                locationId: locations[1].id,
                schedule:'partTime',
                modality:'hybrid', 
                applicationLimit:100
            }

            const res = await PUT(makeRequest(data, jobs[0].id),{ params: { id: jobs[0].id } })
            const body = await res.json()
            const jobData = await prisma.job.findUnique({where:{id:jobs[0].id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(jobData?.applicationLimit).toBe(100)
            expect(jobData?.modality).toBe('hybrid')
            expect(jobData?.salary).toBe(9999)
            expect(jobData?.schedule).toBe('partTime')
            expect(jobData?.title).toBe('Frontend jr')
            expect(jobData?.description).toBe('buscamos dev frontend junior que use react')
            expect(jobData?.locationId).toBe(locations[1].id)

        })

        it('quitar salario', async () => {
            mockAuthenticatedSession(0)
            const {salary, ...rest} = jobs[0]
            const data = rest

            const res = await PUT(makeRequest(data, jobs[0].id),{ params: { id: jobs[0].id } })
            const jobData = await prisma.job.findUnique({where:{id:jobs[0].id}})
            
            expect(res.status).toBe(200)
            expect(jobData?.salary).toBeNull()
        })

        it('editar job state:paused', async () => {
            mockAuthenticatedSession(0)
            await prisma.job.update({data:{state:"paused"},where:{id:jobs[0].id}})

            const data = {
                title: 'Frontend jr',
                description: 'buscamos dev frontend junior que use react',
                salary: 9999,
                locationId: locations[1].id,
                schedule:'partTime',
                modality:'hybrid', 
                applicationLimit:100
            }

            const res = await PUT(makeRequest(data, jobs[0].id),{ params: { id: jobs[0].id } })
            const body = await res.json()
            const jobData = await prisma.job.findUnique({where:{id:jobs[0].id}})

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(jobData?.applicationLimit).toBe(100)
            expect(jobData?.modality).toBe('hybrid')
            expect(jobData?.salary).toBe(9999)
            expect(jobData?.schedule).toBe('partTime')
            expect(jobData?.title).toBe('Frontend jr')
            expect(jobData?.description).toBe('buscamos dev frontend junior que use react')
            expect(jobData?.locationId).toBe(locations[1].id)

        })
    })

})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
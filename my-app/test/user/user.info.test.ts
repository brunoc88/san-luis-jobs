import { it, describe, beforeEach, afterAll, afterEach, vi, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { GET } from "@/app/api/users/[username]/route"
import { GET as GETJOBS } from "@/app/api/users/[username]/jobs/route"
import { GET as GETSAVEDJOBS } from "@/app/api/users/[username]/saved-jobs/route"
import { getUsers } from "../fake.user"
import clearTestDb from "../clearTestDb"
import { getJobs, loadJobs } from "../fakeJobs"
import { NextRequest } from "next/server"

let users: any[]
let jobs: any[]

beforeEach(async () => {
    await clearTestDb()
    await loadJobs()

    users = await getUsers()
    jobs = await getJobs()

    await saveJobs()

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

const mackeRequest = async (name: string) => {
    return await GET({ params: { username: name } })
}

const mackeRequest2 = async (name: string, sort?: string | null, search?: string | null, page?: number | null | any) => {
    if (sort) {
        return await GETJOBS(
            new NextRequest(`http://localhost/api/users/${name}/jobs?sort=${sort}`, {
                method: 'GET'
            }),
            {
                params: Promise.resolve({ username: name })
            }
        )
    }
    if (search) {
        return await GETJOBS(
            new NextRequest(`http://localhost/api/users/${name}/jobs?search=${search}`, {
                method: 'GET'
            }),
            {
                params: Promise.resolve({ username: name })
            }
        )
    }

    if (page) {
        return await GETJOBS(
            new NextRequest(`http://localhost/api/users/${name}/jobs?page=${page}`, {
                method: 'GET'
            }),
            {
                params: Promise.resolve({ username: name })
            }
        )
    }
    return await GETJOBS(
        new NextRequest(`http://localhost/api/users/${name}/jobs`, {
            method: 'GET'
        }),
        {
            params: Promise.resolve({ username: name })
        }
    )
}

const mackeRequest3 = async (name: string, sort?: string | null, search?: string | null, page?: number | null | any) => {
    if (sort) {
        return await GETSAVEDJOBS(
            new NextRequest(`http://localhost/api/users/${name}/saved-jobs?sort=${sort}`, {
                method: 'GET'
            }),
            {
                params: Promise.resolve({ username: name })
            }
        )
    }
    if (search) {
        return await GETSAVEDJOBS(
            new NextRequest(`http://localhost/api/users/${name}/saved-jobs?search=${search}`, {
                method: 'GET'
            }),
            {
                params: Promise.resolve({ username: name })
            }
        )
    }

    if (page) {
        return await GETSAVEDJOBS(
            new NextRequest(`http://localhost/api/users/${name}/saved-jobs?page=${page}`, {
                method: 'GET'
            }),
            {
                params: Promise.resolve({ username: name })
            }
        )
    }
    return await GETSAVEDJOBS(
        new NextRequest(`http://localhost/api/users/${name}/saved-jobs`, {
            method: 'GET'
        }),
        {
            params: Promise.resolve({ username: name })
        }
    )
}

const saveJobs = async () => {

    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[0].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[2].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[3].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[4].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[7].id } })
    await prisma.savedJob.create({ data: { userId: users[1].id, jobId: jobs[5].id } }) // suspendido
}

describe('GET /api/users/username', () => {
    describe('ver info de usuario', () => {
        it('ver perfil de usuario publico', async () => {
            mockAuthenticatedSession(6)

            const res = await mackeRequest('common1')
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('user')
            expect(body.user).toHaveProperty('username')
            expect(body.user).toHaveProperty('pic')
            expect(body.user).toHaveProperty('email')
            expect(body.user).toHaveProperty('description')
            expect(body.user.isPublic).toBe(true)

        })

        it('ver propio perfil', async () => {
            mockAuthenticatedSession(1)

            const res = await mackeRequest('admin2')
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('user')
            expect(body.user).toHaveProperty('username')
            expect(body.user).toHaveProperty('pic')
            expect(body.user).toHaveProperty('email')
            expect(body.user).toHaveProperty('description')
            expect(body.user.isPublic).toBe(true)
        })

        it('ver perfil privado', async () => {
            mockAuthenticatedSession(0)

            // lo hacemos privado
            await prisma.user.update({ data: { visibility: false }, where: { id: users[1].id } })

            const res = await mackeRequest('admin2')
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('user')
            expect(body.user).toHaveProperty('username')
            expect(body.user).toHaveProperty('pic')
            expect(body.user).not.toHaveProperty('email')
            expect(body.user).not.toHaveProperty('description')
            expect(body.user.isPublic).toBe(false)

        })
    })
})

describe('GET /api/users/:username/jobs', () => {
    it('ver jobs de usuario privado', async () => {
        mockAuthenticatedSession(0)
        // lo hacemos privado
        await prisma.user.update({ data: { visibility: false }, where: { id: users[1].id } })

        const res = await mackeRequest2('admin2')

        expect(res.status).toBe(403)
    })

    it('ver jobs perfil de usuario publico', async () => {
        mockAuthenticatedSession(6)

        const res = await mackeRequest2('admin2')
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('userJobsInfo')
        expect(body.userJobsInfo).toHaveProperty('jobs')
        expect(body.userJobsInfo.jobs.every((job: any) => !Object.hasOwn(job, 'state'))).toBe(true)
        expect(body.userJobsInfo.length).not.toBe(0)

    })

    it('ver jobs del propio perfil ', async () => {
        mockAuthenticatedSession(1)

        const res = await mackeRequest2('admin2')
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('userJobsInfo')
        expect(body.userJobsInfo).toHaveProperty('jobs')
        expect(body.userJobsInfo.jobs.every((job: any) => Object.hasOwn(job, 'state'))).toBe(true)
        expect(body.userJobsInfo.length).not.toBe(0)

    })

    it('ver jobs parametro sort ', async () => {
        mockAuthenticatedSession(0)

        const res = await mackeRequest2('admin2', 'alphabetical')
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('userJobsInfo')
        expect(body.userJobsInfo).toHaveProperty('jobs')
        expect(body.userJobsInfo.jobs.every((job: any) => !Object.hasOwn(job, 'state'))).toBe(true)
        expect(body.userJobsInfo.length).not.toBe(0)

    })

    it('ver jobs parametro search ', async () => {
        mockAuthenticatedSession(0)

        const res = await mackeRequest2('admin2', null, 'ad')
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('userJobsInfo')
        expect(body.userJobsInfo).toHaveProperty('jobs')
        expect(body.userJobsInfo.jobs.every((job: any) => !Object.hasOwn(job, 'state'))).toBe(true)
        expect(body.userJobsInfo.length).not.toBe(0)

    })

    it('ver jobs parametro page ', async () => {
        mockAuthenticatedSession(0)

        const res = await mackeRequest2('admin2', null, null, 2)
        const body = await res.json()
        
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('userJobsInfo')
        expect(body.userJobsInfo).toHaveProperty('jobs')
    })

    it('validacion zod page', async () => {
        mockAuthenticatedSession(0)

        const res = await mackeRequest2('admin2', null, null, 'avc')
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body).toHaveProperty('error')
        expect(body.error).toHaveProperty('page')
        expect(body.error.page).toContain('Debe ingresar un numero')
    })
})

describe('GET /api/users/:username/saved-jobs', () => {
    it('ver jobs guardados de un usuario', async () => {
        mockAuthenticatedSession(0)

        const res = await mackeRequest3('admin2')

        expect(res.status).toBe(403)
    })

    it('ver mis jobs guardados', async () => {
        mockAuthenticatedSession(1)

        const res = await mackeRequest3('admin2')
        const body = await res.json()
        
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('savedJobsInfo')
        expect(body.savedJobsInfo).toHaveProperty('jobs')

    })

    it('ver saved jobs parametro sort ', async () => {
        mockAuthenticatedSession(1)

        const res = await mackeRequest3('admin2', 'alphabetical')
        const body = await res.json()

        
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('savedJobsInfo')
        expect(body.savedJobsInfo).toHaveProperty('jobs')

    })

    it('ver jobs parametro search ', async () => {
        mockAuthenticatedSession(1)

        const res = await mackeRequest3('admin2', null, 'd')
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveProperty('savedJobsInfo')
        expect(body.savedJobsInfo).toHaveProperty('jobs')
    })

    it('ver jobs parametro page ', async () => {
        mockAuthenticatedSession(1)

        const res = await mackeRequest3('admin2', null, null, 2)
        const body = await res.json()
        
        expect(res.status).toBe(200)
        expect(body).toHaveProperty('savedJobsInfo')
        expect(body.savedJobsInfo).toHaveProperty('jobs')
    })
})

afterEach(() => {
    vi.clearAllMocks()
})
afterAll(async () => {
    await prisma.$disconnect()
})
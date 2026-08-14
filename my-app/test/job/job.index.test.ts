import { describe, it, beforeEach, afterAll, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { GET } from "@/app/api/jobs/route"
import { loadJobs, getJobs } from "../fakeJobs"
import { NextRequest } from "next/server"
import { getLocations } from "../dummy.locations"

let jobs: any = []
let locations: any = []

beforeEach(async () => {
    await prisma.application.deleteMany()
    await prisma.job.deleteMany()
    await prisma.location.deleteMany()
    await prisma.user.deleteMany()

    await loadJobs()
    jobs = await getJobs()
    locations = await getLocations()
})

describe('GET /api/jobs', () => {
    describe('sin query parems', () => {
        it('/', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
            expect(body.jobs.length).toEqual(10)
        })
    })

    describe('query parems', () => {

        it('/jobs?limit=2', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?limit=2"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
            expect(body.jobs.length).toEqual(2)
        })

        it('/jobs?page=2', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?page=2"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
            expect(body.jobs.length).toEqual(10)
        })

        it('/jobs?search=backend', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?search=backend"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()

        })

        it('/jobs?locationId', async () => {
            const request = new NextRequest(
                `http://localhost/api/jobs?locationId=${locations[0].id}`
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()

        })

        it('/jobs?schedule', async () => {
            const request = new NextRequest(
                `http://localhost/api/jobs?schedule=fullTime`
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()

        })

        it('/jobs?modality', async () => {
            const request = new NextRequest(
                `http://localhost/api/jobs?modality=remote`
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()

        })


    })

    describe('query parems combinados', () => {
        it('/jobs?page=2&limit=7', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?page=2&limit=7"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
            expect(body.jobs.length).toEqual(7)
        })

        it('/jobs?search=node&page=2&limit=10', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?search=node&page=2&limit=10"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')

        })

        it('/jobs?locationId=3&modality=remote', async () => {
            const request = new NextRequest(
                `http://localhost/api/jobs?locationId=${locations[1].id}&modality=remote`
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')

        })

        it('/jobs?search=backend&locationId=2&schedule=fullTime&sort=recent&page=1&limit=5', async () => {
            const res = await GET(new NextRequest(
                `http://localhost/api/jobs?search=backend&locationId=${locations[1].id}&schedule=fullTime&sort=recent&page=1&limit=5`
            ))
            const body = await res.json()
            
            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
        })

    })

    describe('validaciones zod', () => {
        it('/jobs?page=0', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?page=0"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('page')
            expect(body.error.page).toContain('La página debe ser mayor a 0.')

        })

        it('/jobs?page=null', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?page=null"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('page')
            expect(body.error.page).toContain('Debe ingresar un numero')

        })

        it('/jobs?page=undefined', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?page=undefined"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('page')
            expect(body.error.page).toContain('Debe ingresar un numero')

        })

        it('/jobs?page=', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?page="
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('page')
            expect(body.error.page).toContain('La página debe ser mayor a 0.')

        })

        it('/jobs?limit=-10', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?limit=-10"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('limit')
            expect(body.error.limit).toContain('El límite debe ser mayor a 0.')

        })

        it('/jobs?limit=abc', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?limit=abc"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('limit')
            expect(body.error.limit).toContain('Debe ingresar un numero')

        })

        it('/jobs?modality=hogar', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?modality=hogar"
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('modality')
            expect(body.error.modality).toContain('Modalidad inválida.')
        })

        it('/jobs?modality=', async () => {
            const request = new NextRequest(
                "http://localhost/api/jobs?modality="
            )
            const res = await GET(request)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body).toHaveProperty('error')
            expect(body.error).toHaveProperty('modality')
            expect(body.error.modality).toContain('Modalidad inválida.')
        })
    })

    describe('por orden(sort)', () => {
        it('/jobs?sort=alphabetical', async () => {
            const res = await GET(new NextRequest(
                'http://localhost/api/jobs?sort=alphabetical'
            ))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
        })

        it('/jobs?sort=recent', async () => {
            const res = await GET(new NextRequest(
                'http://localhost/api/jobs?sort=recent'
            ))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
        })

        it('/jobs?sort=popular', async () => {
            const res = await GET(new NextRequest(
                'http://localhost/api/jobs?sort=popular'
            ))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveProperty('jobs')
            expect(body.jobs).not.toBeNull()
        })
    })
})

afterAll(async () => {
    await prisma.$disconnect()
})
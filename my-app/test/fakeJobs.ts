import { prisma } from "@/lib/prisma"
import { getUsers, loadUsers } from "./fake.user"
import { getLocations, loadLocations } from "./dummy.locations"

let users: any[]
let locations: any[]

export const loadJobs = async () => {
    await loadUsers()
    await loadLocations()

    users = await getUsers()
    locations = await getLocations()

    
    await prisma.job.createMany({
        data: [
            {
                title: 'Backend Node.js Junior',
                description: 'Buscamos desarrollador backend con conocimientos en Node.js, Express y PostgreSQL.',
                salary: 1800000,
                applicationLimit: 50,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[0].id
            },

            {
                title: 'Frontend React',
                description: 'Empresa de tecnología busca desarrollador React con experiencia en TypeScript.',
                salary: 1600000,
                applicationLimit: null,
                state: 'active',
                modality: 'hybrid',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[1].id
            },

            {
                title: 'QA Manual',
                description: 'Se busca tester manual para participar en pruebas funcionales y de integración.',
                salary: null,
                applicationLimit: 20,
                state: 'active',
                modality: 'onSite',
                schedule: 'partTime',
                locationId: locations[0].id,
                userId: users[3].id
            },

            {
                title: 'DevOps Engineer',
                description: 'Administración de infraestructura, Docker, CI/CD y monitoreo de aplicaciones.',
                salary: 2500000,
                applicationLimit: null,
                state: 'paused',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[4].id
            },

            {
                title: 'Diseñador UX/UI',
                description: 'Diseño de interfaces modernas orientadas a mejorar la experiencia del usuario.',
                salary: 1700000,
                applicationLimit: 15,
                state: 'finished',
                modality: 'hybrid',
                schedule: 'partTime',
                locationId: locations[0].id,
                userId: users[6].id
            },

            {
                title: 'Administrador de Sistemas',
                description: 'Administración de servidores Linux, redes y mantenimiento de infraestructura.',
                salary: 2200000,
                applicationLimit: 30,
                state: 'active',
                modality: 'onSite',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[7].id,
                isSuspended: true
            },

            {
                title: 'Analista Funcional',
                description: 'Relevamiento de requerimientos y comunicación entre clientes y desarrollo.',
                salary: 1900000,
                applicationLimit: null,
                state: 'active',
                modality: 'hybrid',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[0].id,
                isActive: false
            },

            {
                title: 'Soporte Técnico',
                description: 'Atención a usuarios, resolución de incidencias y mantenimiento de equipos.',
                salary: 1200000,
                applicationLimit: 10,
                state: 'active',
                modality: 'onSite',
                schedule: 'partTime',
                locationId: locations[1].id,
                userId: users[3].id
            }
        ]
    })
}

export const getJobs = async () => {
    return await prisma.job.findMany()
}
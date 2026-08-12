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
            },
            {
                title: 'Full Stack Developer',
                description: 'Desarrollo de aplicaciones utilizando React, Node.js y PostgreSQL.',
                salary: 2100000,
                applicationLimit: 25,
                state: 'active',
                modality: 'hybrid',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[1].id
            },
            {
                title: 'Backend Java',
                description: 'Desarrollo de APIs REST con Spring Boot.',
                salary: 2300000,
                applicationLimit: null,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[4].id
            },
            {
                title: 'Analista QA Automation',
                description: 'Automatización de pruebas utilizando Playwright.',
                salary: 1800000,
                applicationLimit: 20,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[3].id
            },
            {
                title: 'Desarrollador PHP',
                description: 'Mantenimiento y desarrollo de sistemas en Laravel.',
                salary: 1500000,
                applicationLimit: 15,
                state: 'active',
                modality: 'onSite',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[6].id
            },
            {
                title: 'Programador Python',
                description: 'Desarrollo de scripts y APIs utilizando FastAPI.',
                salary: 2200000,
                applicationLimit: null,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[7].id
            },
            {
                title: 'Data Analyst',
                description: 'Análisis de datos y generación de reportes en Power BI.',
                salary: 1700000,
                applicationLimit: 12,
                state: 'active',
                modality: 'hybrid',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[0].id
            },
            {
                title: 'Mobile Developer',
                description: 'Desarrollo de aplicaciones móviles con React Native.',
                salary: 2000000,
                applicationLimit: 20,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[1].id
            },
            {
                title: 'Administrador de Base de Datos',
                description: 'Gestión y optimización de bases de datos PostgreSQL.',
                salary: 2400000,
                applicationLimit: null,
                state: 'active',
                modality: 'onSite',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[4].id
            },
            {
                title: 'Scrum Master',
                description: 'Facilitación de ceremonias ágiles y seguimiento del equipo.',
                salary: 1900000,
                applicationLimit: 10,
                state: 'active',
                modality: 'hybrid',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[6].id
            },
            {
                title: 'Product Owner',
                description: 'Gestión del backlog y definición de prioridades.',
                salary: 2500000,
                applicationLimit: 8,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[7].id
            },
            {
                title: 'Desarrollador C#',
                description: 'Desarrollo de aplicaciones empresariales con .NET.',
                salary: 2300000,
                applicationLimit: 18,
                state: 'active',
                modality: 'hybrid',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[0].id
            },
            {
                title: 'Ingeniero de Datos',
                description: 'Construcción de pipelines de datos.',
                salary: 2600000,
                applicationLimit: null,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[1].id
            },
            {
                title: 'Especialista SEO',
                description: 'Optimización de posicionamiento web.',
                salary: 1400000,
                applicationLimit: 15,
                state: 'active',
                modality: 'remote',
                schedule: 'partTime',
                locationId: locations[0].id,
                userId: users[3].id
            },
            {
                title: 'Community Manager',
                description: 'Gestión de redes sociales y campañas digitales.',
                salary: 1300000,
                applicationLimit: null,
                state: 'active',
                modality: 'hybrid',
                schedule: 'partTime',
                locationId: locations[1].id,
                userId: users[4].id
            },
            {
                title: 'Diseñador Gráfico',
                description: 'Creación de piezas gráficas para medios digitales.',
                salary: 1450000,
                applicationLimit: 20,
                state: 'active',
                modality: 'onSite',
                schedule: 'partTime',
                locationId: locations[0].id,
                userId: users[6].id
            },
            {
                title: 'Frontend Vue.js',
                description: 'Desarrollo de interfaces utilizando Vue 3.',
                salary: 1800000,
                applicationLimit: 25,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[7].id
            },
            {
                title: 'Programador Go',
                description: 'Desarrollo de microservicios en Go.',
                salary: 2600000,
                applicationLimit: null,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[0].id
            },
            {
                title: 'Administrador Cloud',
                description: 'Administración de infraestructura AWS.',
                salary: 2800000,
                applicationLimit: 15,
                state: 'active',
                modality: 'hybrid',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[1].id
            },
            {
                title: 'Especialista en Seguridad',
                description: 'Análisis de vulnerabilidades y hardening.',
                salary: 2900000,
                applicationLimit: 10,
                state: 'active',
                modality: 'onSite',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[3].id
            },
            {
                title: 'Soporte Nivel 2',
                description: 'Resolución de incidencias técnicas avanzadas.',
                salary: 1500000,
                applicationLimit: 20,
                state: 'active',
                modality: 'hybrid',
                schedule: 'partTime',
                locationId: locations[1].id,
                userId: users[4].id
            },
            {
                title: 'Arquitecto de Software',
                description: 'Diseño de arquitecturas escalables para sistemas distribuidos.',
                salary: 3200000,
                applicationLimit: 5,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[0].id,
                userId: users[6].id
            },
            {
                title: 'Ingeniero de IA',
                description: 'Desarrollo de soluciones basadas en inteligencia artificial.',
                salary: 3500000,
                applicationLimit: 12,
                state: 'active',
                modality: 'remote',
                schedule: 'fullTime',
                locationId: locations[1].id,
                userId: users[7].id
            },
        ]
    })
}

export const getJobs = async () => {
    return await prisma.job.findMany()
}
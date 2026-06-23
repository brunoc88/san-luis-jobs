import { prisma } from "@/lib/prisma"
import bcrypt from 'bcryptjs'


export const LoadUsers = async () => {
    const passwordHash = await bcrypt.hash('sekrets', 10)
    const fakePic = 'fakepic.png'

    // admins
    await prisma.user.createMany({
        data: [
            {
                email: 'admin1@test.com',
                username: 'admin1',
                password: passwordHash,
                role: 'admin',
                isActive: true,
                visibility: true,
                pic: fakePic
            },

            {
                email: 'admin2@test.com',
                username: 'admin2',
                password: passwordHash,
                role: 'admin',
                isActive: true,
                visibility: true,
                pic: fakePic
            },

            {
                email: 'admin3@test.com',
                username: 'admin3',
                password: passwordHash,
                role: 'admin',
                isActive: false,
                visibility: true,
                pic: fakePic
            }
        ]
    })

    // common
    await prisma.user.createMany({
        data: [
            {
                email: 'common1@test.com',
                username: 'common1',
                password: passwordHash,
                role: 'common',
                isActive: true,
                visibility: true,
                pic: fakePic
            },

            {
                email: 'common2@test.com',
                username: 'common2',
                password: passwordHash,
                role: 'common',
                isActive: true,
                visibility: true,
                pic: fakePic
            },

            {
                email: 'common3@test.com',
                username: 'common3',
                password: passwordHash,
                role: 'common',
                isActive: false,
                visibility: true,
                pic: fakePic
            }
        ]
    })

    // super
    await prisma.user.createMany({
        data: [
            {
                email: 'super1@test.com',
                username: 'super1',
                password: passwordHash,
                role: 'superAdmin',
                isActive: true,
                visibility: true,
                pic: fakePic
            },

            {
                email: 'super2@test.com',
                username: 'super2',
                password: passwordHash,
                role: 'superAdmin',
                isActive: true,
                visibility: true,
                pic: fakePic
            },

            {
                email: 'super3@test.com',
                username: 'super3',
                password: passwordHash,
                role: 'superAdmin',
                isActive: false,
                visibility: true,
                pic: fakePic
            }
        ]
    })
}

export const getUsers = async () : Promise<{id:number, email:string, role:string, isActive:boolean}[]> => {
    let users:{id:number, email:string, role:string, isActive:boolean}[]

    let userDb = await prisma.user.findMany()

    users = userDb.map(u=> ({id:u.id, email:u.email, role:u.role, isActive:u.isActive}))

    return users
}
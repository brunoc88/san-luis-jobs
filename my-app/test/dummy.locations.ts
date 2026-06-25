import { prisma } from "@/lib/prisma"

export const loadLocations = async () => {
    await prisma.location.createMany({
        data:[
            {
                name:'Villa Mercedes'
            },{
                name:'San Luis'
            },
            {
                name:'Justo Daract',
                isActive:false
            }
        ]
    })
}

export const getLocations = async () =>{
    return await prisma.location.findMany()
}
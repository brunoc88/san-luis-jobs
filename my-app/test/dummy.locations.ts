import { prisma } from "@/lib/prisma"

export const loadLocations = async () => {
    await prisma.location.createMany({
        data:[
            {
                name:'villa mercedes'
            },{
                name:'san luis'
            },
            {
                name:'justo daract',
                isActive:false
            }
        ]
    })
}

export const getLocations = async () =>{
    return await prisma.location.findMany()
}
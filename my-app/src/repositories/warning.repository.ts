import { prisma } from "@/lib/prisma"
import { WarningCreate } from "@/types/warning/warning.type"
import { Warning } from "@prisma/client"

export const warningRepo = {
    create: async (data: WarningCreate): Promise<Warning> => await prisma.warning.create({ data }),

    count: async (id: number): Promise<number> => await prisma.warning.count({ where: { userId:id } })
}
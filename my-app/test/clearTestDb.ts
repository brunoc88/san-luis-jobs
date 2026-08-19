import { prisma } from "@/lib/prisma"

const clearTestDb = async () => {
    await prisma.feedback.deleteMany()
    await prisma.job.deleteMany()
    await prisma.user.deleteMany()
}

export default clearTestDb
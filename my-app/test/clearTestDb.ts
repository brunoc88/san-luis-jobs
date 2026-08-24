import { prisma } from "@/lib/prisma"

const clearTestDb = async () => {
    await prisma.complaint.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.job.deleteMany()
    await prisma.location.deleteMany()
    await prisma.user.deleteMany()
}

export default clearTestDb
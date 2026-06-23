import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthorizeInput, AuthorizedUser } from "@/types/auth/user.auth.types"

export const authorizeUser = async ({ user, password }: AuthorizeInput): Promise<AuthorizedUser | null> => {
    const userDB = await prisma.user.findFirst({
        where: {
            OR: [
                { email: user },
                { username: user }
            ]
        }
    })

    if (!userDB || !userDB.isActive) return null

    const isValid = await bcrypt.compare(password, userDB.password)
    if (!isValid) return null

    return { id: userDB.id, email: userDB.email, username: userDB.username, role: userDB.role }
}
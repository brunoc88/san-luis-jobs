import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { BadRequestError, UnauthorizedError } from "@/lib/errors/appError"
import { getServerSession } from "next-auth"


const requireSession = async () => {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new UnauthorizedError()

    const id = Number(session.user.id)
    if (isNaN(id)) throw new BadRequestError()

    return id
}

export default requireSession
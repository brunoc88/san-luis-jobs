import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

const getOptionalSessionUser = async () => {
    const session = await getServerSession(authOptions)

    const id = Number(session?.user?.id)

    if (Number.isNaN(id)) return null

    return {
        id,
        role: session?.user.role
    }
}

export default getOptionalSessionUser
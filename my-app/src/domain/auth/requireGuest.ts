import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ForbiddenError } from "@/lib/errors/appError"
import { getServerSession } from "next-auth"

export const requireGuest = async () =>{
    const session = await getServerSession(authOptions)
    if(session?.user.id) throw new ForbiddenError("No podés realizar esta acción con una sesión activa.")
}
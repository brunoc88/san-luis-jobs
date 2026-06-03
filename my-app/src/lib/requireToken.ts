import crypto from "crypto"
import { verificationTokenRepo } from "@/repositories/verificationToken.repository"
import { BadRequestError, NotFoundError } from "./errors/appError"

export const requireToken = async (token: string | null) => {
    if (!token) throw new BadRequestError('Token requerido')

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const verification =
        await verificationTokenRepo.findByToken(tokenHash)

    if (!verification) throw new NotFoundError('Token inválido')

    if (verification.expiresAt < new Date())
        throw new BadRequestError('Token expirado')

    return verification
}
import { BadRequestError } from "./errors/appError"

export const parseId = (id: string): number => {
    const parsedId = Number(id)

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new BadRequestError("ID inválido.")
    }

    return parsedId
}
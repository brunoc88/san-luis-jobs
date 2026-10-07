type HandleErrorResult = {
    status: number
    message: string
}

const handleError = (
    status: number,
    error: unknown
): HandleErrorResult => {

    if (typeof error === "string") {
        return {
            status,
            message: error
        }
    }

    return {
        status,
        message: "Ocurrió un error inesperado"
    }
}

export default handleError
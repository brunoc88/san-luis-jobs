import { NextResponse } from "next/server"
import { AppError } from "./appError"

const errorHandler = (error: any) => {
    if (error instanceof AppError) {
        return NextResponse.json({ errorMessage: error.message }, { status: error.status })
    }

    if (error.code === "P2002") {
        return NextResponse.json(
            { error: `El campo ${error.meta.target} ya está en uso` },
            { status: 409 }
        )
    }

    // race condition/ final de carrera
    if (error.code === 'P2025') {
        return NextResponse.json(
            { error: 'Recurso no encontrado' },
            { status: 404 }
        )
    }


    return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
    )
}

export default errorHandler
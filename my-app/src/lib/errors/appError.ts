export class AppError extends Error {
    status:number
    constructor(message:string, status:number) {
       super(message)
       this.status = status 
    }
}

export class BadRequestError extends AppError {
    constructor (message = 'Solicitud inválida') {
        super(message, 400)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Sin autorizacion') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403)
  }
}


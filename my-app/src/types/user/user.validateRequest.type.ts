import { RegisterUserInput } from "./user.register.type"

type ValidationError = {
    ok: false
    error: unknown
    status: number
}

type ValidationSuccess = {
    ok: true
    data: RegisterUserInput
    file: File | null
}

export type ValidationResult = ValidationError | ValidationSuccess
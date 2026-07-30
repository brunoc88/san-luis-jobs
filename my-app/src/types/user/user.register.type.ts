export type RegisterUserInput = {
    email: string,
    username: string,
    password: string,
    description: string | null
}

export type CreateUserData =  RegisterUserInput & {
    pic: string,
    picPublicId: string | null,
    cv: string | null,
    cvPublicId: string | null
}


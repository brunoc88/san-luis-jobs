export type RegisterUser = {
    email: string,
    username: string,
    password: string,
    description: string | null
}

export type UserToUpload =  RegisterUser & {
    pic: string,
    picPublicId: string | null
}


export type AuthorizeInput = {
  user: string,
  password: string
}

export type AuthorizedUser = {
  id:number,
  email: string,
  username: string,
  role: string
}
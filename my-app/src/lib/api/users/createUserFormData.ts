import { UserRegisterFormDto } from "@/types/user/user.register.type"

const createUserFormData = (data: UserRegisterFormDto) => {
    const formData = new FormData()

    formData.append("email", data.email)
    formData.append("username", data.username)
    formData.append("password", data.password)
    formData.append("password2", data.password2)
    formData.append("description", data.description ?? "")

    if (data.file?.[0]) {
        formData.append("file", data.file[0])
    }

    if (data.cvFile?.[0]) {
        formData.append("cvFile", data.cvFile[0])
    }

    return formData
}

export default createUserFormData
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import userRegisterSchema from "@/lib/schemas/user/user.registerSchema"
import { UserRegisterFormDto } from "@/types/user/user.register.type"
import { useRouter } from "next/navigation"
import { usersApi } from "@/lib/api/users/users"
import handleError from "@/lib/errors/handleErrors"
import createUserFormData from "@/lib/api/users/createUserFormData"
import UserInputs from "@/components/user/userInputs"

const UserRegisterForm = () => {
    type Options = {
        pic: boolean
        cv: boolean
        description: boolean
    }

    const [userOptions, setUserOptions] = useState<Options>({
        pic: false,
        cv: false,
        description: false
    })

    const [serverError, setServerError] = useState<{ status: number, message: string }>({ status: 0, message: '' })

    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<UserRegisterFormDto>({
        resolver: zodResolver(userRegisterSchema)
    })

    const router = useRouter()

    const handleRegisterUser = async (data: UserRegisterFormDto) => {
        try {
            setIsLoading(true)

            const formData = createUserFormData(data)

            const result = await usersApi.registerUser(formData)
            if (!result.ok) {
                const error = handleError(result.status, result.error)
                setServerError(error)
                return
            }

            router.push('/auth/login')
        } catch (error) {
            setIsLoading(false)
        }


    }

    return (
        <div>
            <h1>
                Crea tu cuenta y empieza a buscar y ofrecer empleo
            </h1>

            <form onSubmit={handleSubmit(handleRegisterUser)}>

                <UserInputs 
                serverError={serverError} 
                errors={errors} 
                register={register}
                reset={reset}
                setUserOptions={setUserOptions}
                userOptions={userOptions}
                isLoading={isLoading}
                />

            </form>

        </div>
    )
}

export default UserRegisterForm
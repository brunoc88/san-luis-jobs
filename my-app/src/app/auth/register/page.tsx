"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import userRegisterSchema from "@/lib/schemas/user/user.registerSchema"

import { UserRegisterFormDto } from "@/types/user/user.register.type"
import { UserRegisterOptions } from "@/types/user/userRegisterOptions"

import { useRouter } from "next/navigation"

import { usersApi } from "@/lib/api/users/users"
import handleError from "@/lib/errors/handleErrors"
import createUserFormData from "@/lib/api/users/createUserFormData"

import UserInputs from "@/components/user/userInputs"

import styles from "@/components/user/userRegister.module.css"

const UserRegisterForm = () => {

    const [userOptions, setUserOptions] = useState<UserRegisterOptions>({
        pic: false,
        cv: false,
        description: false
    })

    const [serverError, setServerError] = useState<{
        status: number
        message: string
    }>({
        status: 0,
        message: ""
    })

    const [isLoading, setIsLoading] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<UserRegisterFormDto>({
        resolver: zodResolver(userRegisterSchema),
        defaultValues: {
        email: "",
        username: "",
        password: "",
        password2: "",
        description: ""
    }
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

            setIsRegistered(true)

        } finally {
            setIsLoading(false)
        }
    }

    if (isRegistered) {
        return (
            <div className={styles.registerPage}>
                <div className={styles.registerSuccess}>
                    <h1>¡Cuenta creada!</h1>

                    <p>
                        Revisá tu casilla de correo para activar tu cuenta.
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/auth/login")}
                    >
                        Ir al login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.registerPage}>

            <h1 className={styles.registerTitle}>
                Crea tu cuenta y empieza
                <br />
                a buscar y ofrecer empleo
            </h1>

            <form
                className={styles.registerForm}
                onSubmit={handleSubmit(handleRegisterUser)}
            >
                {isLoading ? (
                    <div className={styles.loading}>
                        <p>Creando tu cuenta...</p>
                    </div>
                ) : (
                    <UserInputs
                        serverError={serverError}
                        errors={errors}
                        register={register}
                        reset={reset}
                        setUserOptions={setUserOptions}
                        userOptions={userOptions}
                    />
                )}
            </form>

        </div>
    )
}

export default UserRegisterForm
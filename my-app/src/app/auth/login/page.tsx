'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import LoginSchema from "@/lib/schemas/auth/login.schema"
import { AuthorizeInput } from '@/types/auth/user.auth.types'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from 'react'
import styles from "./login.module.css"

const LoginPage = () => {
    const [loginError, setLoginError] = useState<string>("")
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(LoginSchema)
    })

    const handleLogin = async (data: AuthorizeInput) => {
        setLoginError('')

        const result = await signIn("credentials", {
            user: data.user,
            password: data.password,
            redirect: false
        })

        if (result?.error === "RATE_LIMIT") {
            setLoginError("Demasiados intentos. Intente nuevamente más tarde.")
            return
        }

        if (result?.ok) {
            router.push("/")
        } else {
            setLoginError("Credenciales inválidas")
        }
    }
    return (
        <div className={styles.loginPage}>

            <div className={styles.loginPresentation}>
                <h1>Busca y ofrece trabajo de forma fácil y rápida</h1>
            </div>

            <form className={styles.loginForm} onSubmit={handleSubmit(handleLogin)}>

                <div className={styles.loginError}>
                    {loginError}
                </div>

                <div className={styles.inputGroup}>
                    <input
                        className={styles.loginInput}
                        type="text"
                        {...register("user")}
                        placeholder="Ingrese un email o nombre de usuario"
                    />

                    {errors.user && (
                        <span className={styles.inputError}>
                            {errors.user.message}
                        </span>
                    )}
                </div>

                <div className={styles.inputGroup}>
                    <input
                        className={styles.loginInput}
                        type="password"
                        {...register("password")}
                        placeholder="Password"
                    />

                    {errors.password && (
                        <span className={styles.inputError}>
                            {errors.password.message}
                        </span>
                    )}
                </div>

                <button
                    className={styles.googleButton}
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                    Continuar con Google
                </button>

                <div className={styles.forgotPassword}>
                    <p>¿Olvidaste tu password?</p>
                </div>

                <div className={styles.loginActions}>
                    <button type="submit">Ingresar</button>
                    <button type="button" onClick={()=>{router.push('/auth/register')}}>Registrarse</button>
                </div>

            </form>

        </div>
    )
}

export default LoginPage

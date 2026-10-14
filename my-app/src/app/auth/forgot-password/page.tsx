'use client'

import { authApi } from "@/lib/api/auth/auth"
import { passwordRecoverySchema } from "@/lib/schemas/auth/password.recovery.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

const ForgotPasswordPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(passwordRecoverySchema)
    })
    const [serverError, setServerError] = useState<{ status: number, message: string }>()
    const [message, setMessage] = useState<{ status: number, msg: string }>()
    const [loading, setLoading] = useState<boolean>(false)

    const handlePasswordRequest = async (data: { email: string }) => {
        try {
            setLoading(true)
            const res = await authApi.forgotPassword(data)
            if (!res.ok) {
                setServerError({ status: res.status, message: res.error })
                return
            }
            setMessage({ status: res.status, msg: 'Solicitud enviada' })
            setTimeout(() => {
                setMessage({status:0, msg:''})
            }, 5000)
            
        } catch (error) {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            setLoading(false)    
        }

    }

    return (
        <div>

            <div>
                <p>Olvidaste tu password?. No te preocupes, solicita uno nuevo y recibiras un email para solicitar una nueva</p>
            </div>

            <div>
                {serverError && <>{serverError.message}</>}
                {message && <>{message.msg}</>}
                <form onSubmit={handleSubmit(handlePasswordRequest)}>
                    <div>
                        <input type="text"
                            {...register("email")}
                            placeholder="Ingrese un email"
                        />
                    </div>
                    {errors.email && (
                        <span>
                            {errors.email.message}
                        </span>
                    )}
                    <div>
                        {!loading ? (<><button type="submit">Enviar</button></>)
                            : (<p>Cargando...</p>)}
                    </div>
                </form>
            </div>

        </div>

    )
}

export default ForgotPasswordPage
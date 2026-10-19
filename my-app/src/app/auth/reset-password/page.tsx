'use client'

import { authApi } from "@/lib/api/auth/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const ResetPasswordPage = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(true)
    const [errorServer, setErrorServer] = useState<{status:number, message:string}>()
    const [valid, setValid] = useState<boolean>(false)

    useEffect(()=>{

        const verifyToken = async () => {
            try {
                const res = await authApi.checkToken(token)
                if(!res.ok) {
                    setErrorServer({status:res.status, message:res.error})
                    router.push('/auth/login')
                    return
                }else{
                    setValid(true)
                    return
                }


            } catch (error) {
                setErrorServer( {status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."})
                return 
            } finally {
                setLoading(false)
            }
        }
        if(token) {
            verifyToken()
        }
        else {
            setErrorServer({status:400, message:'Falta Token'})
            setLoading(false)
        }
        
    },[])

    if(loading) return <p>Cargando...</p>
    return (
        <div>
            {errorServer?(
                <p>{errorServer.message}</p>
            ):(<>
                <form action="">
                    <div>
                        <input type="password" 
                            placeholder="Ingrese nuevo password"
                        />
                    </div>
                        <input type="password" 
                            placeholder="Confirmar password"
                        />
                    <div>
                        <button type="submit">Enviar</button>
                    </div>
                </form>
            </>)}
        </div>
    )
}

export default ResetPasswordPage
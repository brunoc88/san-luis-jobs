'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AdminOnlyProps {
  children: React.ReactNode
  redirectTo?: string
}

const AdminOnly = ({ children, redirectTo = "/" }: AdminOnlyProps) => {
  const { data, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(redirectTo)
    }

    if (status === "authenticated" && data.user.role === "common") {
      router.replace(redirectTo)
    }
  }, [status, data, router, redirectTo])

  if (status === "loading" || status === "unauthenticated") {
    return <p>Cargando...</p>
  }

  if (data?.user.role === "common") {
    return <p>Cargando...</p>
  }

  return children
}

export default AdminOnly
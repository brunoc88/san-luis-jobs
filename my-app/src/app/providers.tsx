'use client'

import NavBar from "@/components/common/NavBar"
import { SessionProvider } from "next-auth/react"

type ProvidersProps = {
    children: React.ReactNode
}

const Providers = ({ children }: ProvidersProps) => {
    return (
        <SessionProvider>
            <NavBar>
                {children}
            </NavBar>
        </SessionProvider>
    )
}

export default Providers
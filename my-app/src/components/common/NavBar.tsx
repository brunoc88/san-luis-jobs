import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getLogoutRedirect } from "@/lib/utils/auth/logout.utils"
import styles from "./navbar.module.css"

const NavBar = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const hideLoginButton = [
        "/auth/login",
        "/auth/forgot-password",
        "/auth/reset-password/",
        "/auth/confirm/"
    ].some((path) =>
        path.endsWith("/")
            ? pathname.startsWith(path)
            : pathname === path
    )

    return (
        <>
            <nav className={styles.navbar}>
                <Link href="/" className={styles.logo}>
                    <img src="/logo.png" alt="San Luis Jobs" />
                </Link>

                {session?.user.id ? (
                    <button
                        className={styles.logoutButton}
                        onClick={() => signOut({
                            callbackUrl: getLogoutRedirect(pathname)
                        })}
                    >
                        Salir
                    </button>
                ) : (
                    !hideLoginButton && (
                        <button
                            className={styles.logoutButton}
                            onClick={() => router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)}
                        >
                            Iniciar sesión
                        </button>
                    )
                )}
            </nav>

            {children}
        </>
    )
}

export default NavBar
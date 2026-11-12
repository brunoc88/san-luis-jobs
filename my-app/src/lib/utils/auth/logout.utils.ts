export const getLogoutRedirect = (pathname: string): string => {
    if (pathname.startsWith("/jobs/")) {
        return pathname
    }

    return "/"
}
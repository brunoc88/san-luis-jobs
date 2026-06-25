import { ForbiddenError } from "@/lib/errors/appError"

type userRole = "common" | "admin" | "superAdmin"

export const requireAdmin = (role:userRole) => {
    if(role !== "admin" && role !== "superAdmin") throw new ForbiddenError() 
}
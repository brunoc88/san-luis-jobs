import { requireActiveUserById } from "@/domain/auth/requireActiveUserById"
import { ForbiddenError, NotFoundError } from "@/lib/errors/appError"
import { adminRepo } from "@/repositories/admin.repository"
import { userRepo } from "@/repositories/user.repository"

export const adminService = {
    activateSuspendedAccount: async (userId: number, suspendedUserId: number) => {
        const user = await requireActiveUserById(userId)
        if (user.role !== 'superAdmin') throw new ForbiddenError()

        const suspendedUserData = await userRepo.findById(suspendedUserId)
        if (!suspendedUserData) throw new NotFoundError()

        if (user.id === suspendedUserData.id) throw new ForbiddenError('No puedes levantar tu propia suspension!')

        if (suspendedUserData.isActive && !suspendedUserData.isSuspended) {
            throw new ForbiddenError('suspension ya levantada')
        }

        if (suspendedUserData.role === 'superAdmin') {
            throw new ForbiddenError('No puedes levantar suspension de otro superAdmin')
        }

        await adminRepo.activateSuspendedAccountById(suspendedUserData.id)
        await adminRepo.desactivateUserWarningsById(suspendedUserData.id)
        return {
            email: suspendedUserData.email
        }
    },

    toggleRole: async (userId: number, selectedUserId: number) => {
        const user = await requireActiveUserById(userId)
        if (user.role !== 'superAdmin') throw new ForbiddenError()

        const selectedUserData = await userRepo.findById(selectedUserId)
        if (!selectedUserData) throw new NotFoundError()


        if (user.id === selectedUserData.id) throw new ForbiddenError('No puedes cambiar tu propio rol')

        type action = 'granted' | 'revoked'


        if (user.role === selectedUserData.role) throw new ForbiddenError('Accion invalida')

        let result: action

        if (selectedUserData.role === 'admin') {
            await adminRepo.revokeAdminRoleById(selectedUserData.id)
            result = 'revoked'
        }
        else {
            if (!selectedUserData.isActive || selectedUserData.isSuspended) throw new ForbiddenError('El usuario no cumple las condiciones')
            await adminRepo.assignAdminRoleById(selectedUserData.id)
            result = 'granted'
        }

        return {
            email: selectedUserData.email,
            result
        }

    }
}
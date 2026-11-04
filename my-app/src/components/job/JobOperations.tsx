'use client'

import { JobState, UserRole } from "@prisma/client"
import styles from "./JobOperations.module.css"

type JobOperationsDto = {
    role: UserRole
    owner: boolean
    jobState: JobState
    isAuth: boolean
}


const JobOperations = ({ owner, isAuth, role }: JobOperationsDto) => {
    {/*Usuario no autetincado */ }
    if (!isAuth) return null

    {/*Usario propietario */ }
    if (owner)
        return (
            <div className={styles.menu}>
                <button className={styles.operationButton}>Editar</button>
                <button className={styles.operationButton}>Eliminar</button>
                <button className={styles.operationButton}>Cancelar</button>
            </div>
        )

    {/* Operaciones de Usuario autentica y no propietario */ }
    if (!owner) return (
        <div>
            {role === 'admin' || role === 'superAdmin' &&
                <div>
                    <button className={styles.operationButton}>Suspender</button>
                </div>
            }
            <div>
                <button>Reportar</button>
            </div>
            <div>
                <button>Cancelar</button>
            </div>
        </div>
    )
}

export default JobOperations
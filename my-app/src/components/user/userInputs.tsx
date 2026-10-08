"use client"

import { useState } from "react"

import {
    FieldErrors,
    UseFormRegister,
    UseFormReset
} from "react-hook-form"

import { UserRegisterFormDto } from "@/types/user/user.register.type"
import { UserRegisterOptions } from "@/types/user/userRegisterOptions"

import styles from "./userRegister.module.css"

type UserInputsProps = {
    serverError: {
        status: number
        message: string
    }
    errors: FieldErrors<UserRegisterFormDto>
    register: UseFormRegister<UserRegisterFormDto>
    reset: UseFormReset<UserRegisterFormDto>
    userOptions: UserRegisterOptions
    setUserOptions: React.Dispatch<
        React.SetStateAction<UserRegisterOptions>
    >
}

const UserInputs = ({
    serverError,
    errors,
    register,
    reset,
    userOptions,
    setUserOptions
}: UserInputsProps) => {

    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)

    return (
        <div className={styles.inputsContainer}>

            {serverError.message && (
                <div className={styles.serverError}>
                    {serverError.message}
                </div>
            )}

            {/* EMAIL */}
            <div className={styles.inputGroup}>
                <label>Email</label>

                <input
                    className={styles.registerInput}
                    type="email"
                    {...register("email")}
                />

                {errors.email && (
                    <span className={styles.inputError}>
                        {errors.email.message}
                    </span>
                )}
            </div>

            {/* USERNAME */}
            <div className={styles.inputGroup}>
                <label>Nombre de usuario</label>

                <input
                    className={styles.registerInput}
                    type="text"
                    {...register("username")}
                />

                {errors.username && (
                    <span className={styles.inputError}>
                        {errors.username.message}
                    </span>
                )}
            </div>

            {/* PASSWORD */}
            <div className={styles.inputGroup}>
                <label>Password</label>

                <div className={styles.passwordWrapper}>
                    <input
                        className={styles.registerInput}
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                    />

                    <button
                        type="button"
                        className={styles.passwordButton}
                        onClick={() => setShowPassword(prev => !prev)}
                    >
                        {showPassword ? "Ocultar" : "Ver"}
                    </button>
                </div>

                {errors.password && (
                    <span className={styles.inputError}>
                        {errors.password.message}
                    </span>
                )}
            </div>

            {/* PASSWORD 2 */}
            <div className={styles.inputGroup}>
                <label>Confirmar password</label>

                <div className={styles.passwordWrapper}>
                    <input
                        className={styles.registerInput}
                        type={showPassword2 ? "text" : "password"}
                        {...register("password2")}
                    />

                    <button
                        type="button"
                        className={styles.passwordButton}
                        onClick={() => setShowPassword2(prev => !prev)}
                    >
                        {showPassword2 ? "Ocultar" : "Ver"}
                    </button>
                </div>

                {errors.password2 && (
                    <span className={styles.inputError}>
                        {errors.password2.message}
                    </span>
                )}
            </div>

            {/* DESCRIPTION */}
            <div className={styles.optionGroup}>
                <p>¿Querés agregar una descripción?</p>

                <div className={styles.radioOptions}>
                    <label>
                        <input
                            type="radio"
                            name="description"
                            checked={userOptions.description}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    description: true
                                }))
                            }
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="description"
                            checked={!userOptions.description}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    description: false
                                }))
                            }
                        />
                        No
                    </label>
                </div>

                {userOptions.description && (
                    <textarea
                        className={styles.descriptionInput}
                        {...register("description")}
                    />
                )}

                {errors.description && (
                    <span className={styles.inputError}>
                        {errors.description.message}
                    </span>
                )}
            </div>

            {/* PROFILE IMAGE */}
            <div className={styles.optionGroup}>
                <p>¿Querés agregar una imagen de perfil?</p>

                <div className={styles.radioOptions}>
                    <label>
                        <input
                            type="radio"
                            name="pic"
                            checked={userOptions.pic}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    pic: true
                                }))
                            }
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="pic"
                            checked={!userOptions.pic}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    pic: false
                                }))
                            }
                        />
                        No
                    </label>
                </div>

                {userOptions.pic && (
                    <div className={styles.fileSection}>
                        <p>Formatos permitidos: JPG, PNG, WEBP</p>
                        <p>Tamaño máximo: 5 MB</p>

                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            {...register("file")}
                        />
                    </div>
                )}

                {errors.file && (
                    <span className={styles.inputError}>
                        {errors.file.message}
                    </span>
                )}
            </div>

            {/* CV */}
            <div className={styles.optionGroup}>
                <p>¿Querés agregar un CV?</p>

                <div className={styles.radioOptions}>
                    <label>
                        <input
                            type="radio"
                            name="cv"
                            checked={userOptions.cv}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    cv: true
                                }))
                            }
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="cv"
                            checked={!userOptions.cv}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    cv: false
                                }))
                            }
                        />
                        No
                    </label>
                </div>

                {userOptions.cv && (
                    <div className={styles.fileSection}>
                        <p>Formatos permitidos: PDF, DOC, DOCX</p>
                        <p>Tamaño máximo: 10 MB</p>

                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            {...register("cvFile")}
                        />
                    </div>
                )}

                {errors.cvFile && (
                    <span className={styles.inputError}>
                        {errors.cvFile.message}
                    </span>
                )}
            </div>

            {/* ACTIONS */}
            <div className={styles.registerActions}>
                <button type="submit">
                    Registrarse
                </button>

                <button
                    type="button"
                    onClick={() => {
                        reset()

                        setUserOptions({
                            pic: false,
                            cv: false,
                            description: false
                        })
                    }}
                >
                    Limpiar
                </button>
            </div>

        </div>
    )
}

export default UserInputs
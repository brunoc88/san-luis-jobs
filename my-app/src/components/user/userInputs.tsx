const UserInputs = ({serverError, errors, register, reset, userOptions, setUserOptions, isLoading}) => {
    return(
        <div>
            <div>{serverError.message}</div>

                {/* EMAIL */}
                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        {...register("email")}
                    />

                    {errors.email && (
                        <span>
                            {errors.email.message}
                        </span>
                    )}
                </div>

                {/* USERNAME */}
                <div>
                    <label>Nombre de usuario</label>

                    <input
                        type="text"
                        {...register("username")}
                    />

                    {errors.username && (
                        <span>
                            {errors.username.message}
                        </span>
                    )}
                </div>

                {/* PASSWORD */}
                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        {...register("password")}
                    />

                    {errors.password && (
                        <span>
                            {errors.password.message}
                        </span>
                    )}
                </div>

                {/* PASSWORD 2 */}
                <div>
                    <label>Confirmar password</label>

                    <input
                        type="password"
                        {...register("password2")}
                    />

                    {errors.password2 && (
                        <span>
                            {errors.password2.message}
                        </span>
                    )}
                </div>

                {/* DESCRIPTION */}
                <div>
                    <p>¿Querés agregar una descripción?</p>

                    <label>
                        <input
                            type="radio"
                            name="description"
                            checked={userOptions.description === true}
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
                            checked={userOptions.description === false}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    description: false
                                }))
                            }
                        />
                        No
                    </label>

                    {userOptions.description && (
                        <textarea
                            {...register("description")}
                        />
                    )}

                    {errors.description && (
                        <span>
                            {errors.description.message}
                        </span>
                    )}
                </div>

                {/* PROFILE IMAGE */}
                <div>
                    <p>¿Querés agregar una imagen de perfil?</p>

                    <label>
                        <input
                            type="radio"
                            name="pic"
                            checked={userOptions.pic === true}
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
                            checked={userOptions.pic === false}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    pic: false
                                }))
                            }
                        />
                        No
                    </label>

                    {userOptions.pic && (
                        <div>
                            <p>
                                Formatos permitidos: JPG, PNG, WEBP
                            </p>

                            <p>
                                Tamaño máximo: 5 MB
                            </p>

                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                {...register("file")}
                            />
                        </div>
                    )}

                    {errors.file && (
                        <span>
                            {errors.file.message}
                        </span>
                    )}
                </div>

                {/* CV */}
                <div>
                    <p>¿Querés agregar un CV?</p>

                    <label>
                        <input
                            type="radio"
                            name="cv"
                            checked={userOptions.cv === true}
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
                            checked={userOptions.cv === false}
                            onChange={() =>
                                setUserOptions(prev => ({
                                    ...prev,
                                    cv: false
                                }))
                            }
                        />
                        No
                    </label>

                    {userOptions.cv && (
                        <div>
                            <p>
                                Formatos permitidos: PDF, DOC, DOCX
                            </p>

                            <p>
                                Tamaño máximo: 10 MB
                            </p>

                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                {...register("cvFile")}
                            />
                        </div>
                    )}

                    {errors.cvFile && (
                        <span>
                            {errors.cvFile.message}
                        </span>
                    )}
                </div>

                {/* ACTIONS */}
                <div>
                    <button type="submit" >
                        {isLoading ? "Creando cuenta..." : "Registrarse"}
                    </button>

                    <button
                        type="button"
                        disabled={isLoading}
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
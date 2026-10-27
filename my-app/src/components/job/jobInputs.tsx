'use client'

import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { jobOptions } from "@/types/job/job.type"
import { Locations } from "@/types/location/location.types"

import type {
    FieldErrors,
    UseFormRegister,
    UseFormReset
} from "react-hook-form"
import { z } from "zod"

type JobFormInput = z.input<typeof JobRegisterSchema>

type JobInputsProps = {
    errors: FieldErrors<JobFormInput>
    register: UseFormRegister<JobFormInput>
    reset: UseFormReset<JobFormInput>
    locations: Locations
    jobOptions: jobOptions
    setJobOptions: React.Dispatch<
        React.SetStateAction<jobOptions>
    >
    sending: boolean
}

const JobInputs = ({ register, errors, locations, jobOptions, setJobOptions, sending, reset }: JobInputsProps) => {

    return (
        <div>
            {/*TITULO*/}
            <div>
                <label>Titulo:</label>
                <input type="text"
                    {...register('title')}
                />
                {errors.title && (
                    <span>
                        {errors.title.message}
                    </span>
                )}
            </div>

            {/*LOCALIDAD*/}
            <div>
                <label>Localidad:</label>
                <select {...register("locationId", { valueAsNumber: true })}>
                    <option value=""></option>
                    {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.name}
                        </option>
                    ))}
                </select>
                {errors.locationId && (
                    <span>{errors.locationId.message}</span>
                )}
            </div>

            {/*MODALIDAD*/}
            <div>
                <label>Modadilad:</label>
                <select {...register('modality')}>
                    <option value=""></option>
                    <option value="remote">Remoto</option>
                    <option value="hybrid">Hibrida</option>
                    <option value="onSite">Presencial</option>
                </select>
                {errors.modality && (
                    <span>{errors.modality.message}</span>
                )}
            </div>

            {/*JORNADA*/}
            <div>
                <label>Jornada:</label>
                <select {...register("schedule")}>
                    <option value=""></option>
                    <option value="partTime">Media jornada</option>
                    <option value="fullTime">Jornada completa</option>
                </select>

                {errors.schedule && (
                    <span>{errors.schedule.message}</span>
                )}
            </div>

            {/*SALARIO*/}
            <div>
                <p>¿Querés agregar una salario?</p>

                <div>
                    <label>
                        <input
                            type="radio"
                            name="salary"
                            checked={jobOptions.salary}
                            onChange={() =>
                                setJobOptions(prev => ({
                                    ...prev,
                                    salary: true
                                }))
                            }
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="salary"
                            checked={!jobOptions.salary}
                            onChange={() =>
                                setJobOptions(prev => ({
                                    ...prev,
                                    salary: false
                                }))
                            }
                        />
                        No
                    </label>

                    {jobOptions.salary && (
                        <div>
                            <label >Salario:</label>
                            <input
                                placeholder="En pesos argentinos"
                                {...register("salary", { valueAsNumber: true })}
                            />
                        </div>

                    )}

                    {errors.salary && (
                        <span >
                            {errors.salary.message}
                        </span>
                    )}
                </div>
            </div>

            {/*N APLICANTES*/}
            <div>
                <p>¿Querés poner limite de aplicantes?</p>

                <div>
                    <label>
                        <input
                            type="radio"
                            name="apply"
                            checked={jobOptions.applicationLimit}
                            onChange={() =>
                                setJobOptions(prev => ({
                                    ...prev,
                                    applicationLimit: true
                                }))
                            }
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="apply"
                            checked={!jobOptions.applicationLimit}
                            onChange={() =>
                                setJobOptions(prev => ({
                                    ...prev,
                                    applicationLimit: false
                                }))
                            }
                        />
                        No
                    </label>

                    {jobOptions.applicationLimit && (
                        <div>
                            <label >N aplicantes:</label>
                            <input
                                placeholder="maximo 1000"
                                {...register("applicationLimit", { valueAsNumber: true })}
                            />
                        </div>

                    )}

                    {errors.applicationLimit && (
                        <span >
                            {errors.applicationLimit.message}
                        </span>
                    )}
                </div>
            </div>

            {/*DESCRIPTION*/}
            <div>
                <label>Descripcion:</label>
                <textarea
                    {...register('description')}
                ></textarea>
                {errors.description && (
                    <span>
                        {errors.description.message}
                    </span>
                )}
            </div>

            {/*BOTONES */}
            {!sending ? (<div>
                <button type="submit">Crear</button>
                <button 
                    type="button"
                    onClick={() => {
                        reset()

                        setJobOptions({
                            salary:false,
                            applicationLimit:false
                        })
                    }}
                >Limpiar</button>
            </div>) : (
                <p>Enviando...</p>
            )}
        </div>
    )
}

export default JobInputs
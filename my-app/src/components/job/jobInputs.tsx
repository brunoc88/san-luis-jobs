
'use client'

import { JobRegisterSchema } from "@/lib/schemas/job/job.register.schema"
import { jobOptions } from "@/types/job/job.type"
import { Locations } from "@/types/location/location.types"
import type {
  FieldErrors,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue
} from "react-hook-form"
import { z } from "zod"
import styles from "./jobInputs.module.css"
import { useRouter } from "next/navigation"

type JobFormInput = z.input<typeof JobRegisterSchema>

type JobInputsProps = {
  errors: FieldErrors<JobFormInput>
  register: UseFormRegister<JobFormInput>
  reset: UseFormReset<JobFormInput>
  setValue: UseFormSetValue<JobFormInput>
  locations: Locations
  jobOptions: jobOptions
  setJobOptions: React.Dispatch<
    React.SetStateAction<jobOptions>
  >
  sending: boolean
  editMode?: boolean | null
  jobId?: number | null
}

const JobInputs = ({
  register,
  errors,
  locations,
  jobOptions,
  setJobOptions,
  sending,
  reset,
  editMode,
  jobId,
  setValue
}: JobInputsProps) => {
  const router = useRouter()

  const clearForm = () => {
    reset({})

    setJobOptions({
      salary: false,
      applicationLimit: false
    })
  }

  const toggleSalary = (enabled: boolean) => {
    setJobOptions(prev => ({
      ...prev,
      salary: enabled
    }))

    if (!enabled) {
      setValue("salary", undefined, {
        shouldValidate: true,
        shouldDirty: true
      })
    }
  }

  const toggleApplicationLimit = (enabled: boolean) => {
  setJobOptions(prev => ({
    ...prev,
    applicationLimit: enabled
  }))

  if (!enabled) {
    setValue("applicationLimit", undefined, {
      shouldValidate: true,
      shouldDirty: true
    })
  }
}

  return (
    <div className={styles.container}>

      {/* TÍTULO */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          Título
        </label>

        <input
          id="title"
          className={styles.input}
          type="text"
          placeholder="Ej. Desarrollador backend"
          {...register("title")}
        />

        {errors.title && (
          <span className={styles.error}>
            {errors.title.message}
          </span>
        )}
      </div>

      {/* LOCALIDAD */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="locationId">
          Localidad
        </label>

        <select
          id="locationId"
          className={styles.select}
          {...register("locationId", {
            setValueAs: value =>
              value === "" ? undefined : Number(value)
          })}
        >
          <option value="">Seleccioná una localidad</option>

          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>

        {errors.locationId && (
          <span className={styles.error}>
            {errors.locationId.message}
          </span>
        )}
      </div>

      {/* MODALIDAD */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="modality">
          Modalidad
        </label>

        <select
          id="modality"
          className={styles.select}
          {...register("modality")}
        >
          <option value="">Seleccioná una modalidad</option>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrida</option>
          <option value="onSite">Presencial</option>
        </select>

        {errors.modality && (
          <span className={styles.error}>
            {errors.modality.message}
          </span>
        )}
      </div>

      {/* JORNADA */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="schedule">
          Jornada laboral
        </label>

        <select
          id="schedule"
          className={styles.select}
          {...register("schedule")}
        >
          <option value="">Seleccioná una jornada</option>
          <option value="partTime">Media jornada</option>
          <option value="fullTime">Jornada completa</option>
        </select>

        {errors.schedule && (
          <span className={styles.error}>
            {errors.schedule.message}
          </span>
        )}
      </div>

      {/* SALARIO */}
      <div className={styles.optionalSection}>
        <p className={styles.question}>
          ¿Querés agregar un salario?
        </p>

        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              className={styles.radio}
              type="radio"
              name="salaryOption"
              checked={jobOptions.salary}
              onChange={() => toggleSalary(true)}
            />
            Sí
          </label>

          <label className={styles.radioLabel}>
            <input
              className={styles.radio}
              type="radio"
              name="salaryOption"
              checked={!jobOptions.salary}
              onChange={() => toggleSalary(false)}
            />
            No
          </label>
        </div>

        {jobOptions.salary && (
          <div className={styles.optionalField}>
            <label className={styles.label} htmlFor="salary">
              Salario (ARS)
            </label>

            <input
              id="salary"
              className={styles.input}
              type="number"
              min="0"
              placeholder="Ingresá el salario"
              {...register("salary", {
                valueAsNumber: true
              })}
            />

            {errors.salary && (
              <span className={styles.error}>
                {errors.salary.message}
              </span>
            )}
          </div>
        )}
      </div>

      {/* LÍMITE DE POSTULANTES */}
      <div className={styles.optionalSection}>
        <p className={styles.question}>
          ¿Querés establecer un límite de postulantes?
        </p>

        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              className={styles.radio}
              type="radio"
              name="applicationLimitOption"
              checked={jobOptions.applicationLimit}
              onChange={() => toggleApplicationLimit(true)}
            />
            Sí
          </label>

          <label className={styles.radioLabel}>
            <input
              className={styles.radio}
              type="radio"
              name="applicationLimitOption"
              checked={!jobOptions.applicationLimit}
              onChange={() => toggleApplicationLimit(false)}
            />
            No
          </label>
        </div>

        {jobOptions.applicationLimit && (
          <div className={styles.optionalField}>
            <label
              className={styles.label}
              htmlFor="applicationLimit"
            >
              Máximo de postulantes
            </label>

            <input
              id="applicationLimit"
              className={styles.input}
              type="number"
              min="1"
              max="1000"
              placeholder="Máximo 1000"
              {...register("applicationLimit", {
                valueAsNumber: true
              })}
            />

            {errors.applicationLimit && (
              <span className={styles.error}>
                {errors.applicationLimit.message}
              </span>
            )}
          </div>
        )}
      </div>

      {/* DESCRIPCIÓN */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          Descripción del trabajo
        </label>

        <textarea
          id="description"
          className={styles.textarea}
          placeholder="Describí las responsabilidades, requisitos y condiciones del puesto..."
          {...register("description")}
        />

        {errors.description && (
          <span className={styles.error}>
            {errors.description.message}
          </span>
        )}
      </div>

      {/* BOTONES */}
      {!sending ? (
        <div className={styles.actions}>
          <button
            className={styles.button}
            type="submit"
          >
            {editMode ? "Guardar cambios" : "Crear trabajo"}
          </button>

          <button
            className={styles.button}
            type="button"
            onClick={
              editMode
                ? () => router.push(`/jobs/${jobId}`)
                : clearForm
            }
          >
            {editMode ? "Volver" : "Limpiar"}
          </button>
        </div>
      ) : (
        <p role="status" aria-live="polite">
          Enviando...
        </p>
      )}
    </div>
  )
}

export default JobInputs

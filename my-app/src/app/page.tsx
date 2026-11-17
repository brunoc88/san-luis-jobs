'use client'

import { useEffect, useState } from "react"
import { jobsApi } from "@/lib/api/jobs/jobs"
import { Jobs } from "@/types/job/job.type"
import Link from "next/link"
import { locationApi } from "@/lib/api/location/location"
import { Locations } from "@/types/location/location.types"

import styles from "./home.module.css"
import { JobQueryDto, JobQuerySchema } from "@/lib/schemas/job/job.query.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import NotFoundPage from "@/components/common/NotFoundPage"

export default function Home() {
  const JOBS_LIMIT = 10
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<Jobs>()
  const [empty, setEmpty] = useState<boolean>(false)
  const [locations, setLocations] = useState<Locations>()
  const [serverError, setServerError] = useState<{
    status: number
    message: string
  }>()
  const [page, setPage] = useState<number>(1)
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const [sort, setSort] = useState<JobQueryDto["sort"]>("recent")
  const [loadingMore, setLoadingMore] = useState(false)

  const modalityLabels = {
    remote: "Remoto",
    hybrid: "Híbrido",
    onSite: "Presencial"
  } as const

  const scheduleLabels = {
    partTime: "Media jornada",
    fullTime: "Jornada completa"
  } as const

  type JobSearchFormInput = z.input<typeof JobQuerySchema>
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<JobSearchFormInput>({
    resolver: zodResolver(JobQuerySchema)
  })

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await jobsApi.getJobs({
          page: 1,
          limit: JOBS_LIMIT
        })

        if (res.ok) {
          if (res.data.jobs.length === 0) {
            setEmpty(true)
            return
          }

          setData(res.data)
          setHasNextPage(res.data.pagination.hasNextPage)
        }
      } catch (error) {
        setServerError({
          status: 0,
          message: "No se pudo conectar con el servidor. Intentá nuevamente."
        })
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await locationApi.getActiveLocation()

        if (res.ok) {
          if (res.data.locations.length === 0) {
            setServerError({ status: 400, message: 'No hay locaciones disponibles' })
          }
          setLocations(res.data.locations)
          return
        }

      } catch (error) {
        setServerError({
          status: 0,
          message: "No se pudo conectar con el servidor. Intentá nuevamente."
        })
      }
    }

    loadLocations()
  }, [])

  const handleSearchJob = async (filters: JobSearchFormInput) => {
    setPage(1)
    try {
      setLoading(true)
      setEmpty(false)

      const res = await jobsApi.getJobs({
        ...filters,
        sort,
        page: 1,
        limit: JOBS_LIMIT
      })

      if (res.ok) {
        setData(res.data)
        setHasNextPage(res.data.pagination.hasNextPage)

        setEmpty(res.data.jobs.length === 0)
      }
    } catch {
      setServerError({
        status: 0,
        message: "No se pudo conectar con el servidor. Intentá nuevamente."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1

      const res = await jobsApi.getJobs({
        ...getValues(),
        sort,
        page: nextPage,
        limit: JOBS_LIMIT
      })

      if (res.ok) {
       
        setData(prev => {
          if (!prev) return res.data

          return {
            ...res.data,
            jobs: [...prev.jobs, ...res.data.jobs]
          }
        })

        setPage(nextPage)
        setHasNextPage(res.data.pagination.hasNextPage)
      }
    } catch {
      setServerError({
        status: 0,
        message: "No se pudo conectar con el servidor. Intentá nuevamente."
      })
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSortChange = async (newSort: JobQueryDto["sort"]) => {
    setSort(newSort)
    setPage(1)
    setLoading(true)
    setEmpty(false)

    try {
      const res = await jobsApi.getJobs({
        ...getValues(),
        sort: newSort,
        page: 1,
        limit: JOBS_LIMIT
      })

      if (res.ok) {
        setData(res.data)
        setHasNextPage(res.data.pagination.hasNextPage)
        setEmpty(res.data.jobs.length === 0)
      }
    } catch {
      setServerError({
        status: 0,
        message: "No se pudo conectar con el servidor. Intentá nuevamente."
      })
    } finally {
      setLoading(false)
    }
  }


  if (serverError && serverError.status === 404) {
    return (<NotFoundPage message={serverError.message} />)
  }
  if (loading) {
    return (
      <main className={styles.statusPage}>
        <p>Cargando empleos...</p>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.homeContainer}>

        {/* Panel de búsqueda */}
        <section className={styles.searchPanel}>
          <div className={styles.searchContent}>
            <h1 className={styles.searchTitle}>
              ¿Qué tipo de trabajo estás buscando?
            </h1>

            {/*Formulario */}
            <form onSubmit={handleSubmit(handleSearchJob)}
              className={styles.searchForm}>
              <div className={styles.searchRow}>
                {/*Titulo de empleo */}
                <input
                  type="text"
                  placeholder="Ej.: Programador fullstack"
                  className={styles.searchInput}
                  {...register('search')}
                />
                {errors.search &&
                  <span>{errors.search.message}</span>}

                {/*Boton de busqueda */}
                <button
                  type="submit"
                  className={styles.searchButton}
                >
                  Buscar
                </button>
              </div>

              {/*Filtros */}
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label htmlFor="schedule">Jornada</label>
                  <select id="schedule"
                    {...register('schedule')}
                    defaultValue="">
                    <option value="">Todas</option>
                    <option value="partTime">Media jornada</option>
                    <option value="fullTime">Jornada completa</option>
                  </select>
                  {errors.schedule &&
                    <span>{errors.schedule.message}</span>}
                </div>

                <div className={styles.filterGroup}>
                  <label htmlFor="modality">Modalidad</label>
                  <select id="modality"
                    {...register('modality')}
                    defaultValue="">
                    <option value="">Todas</option>
                    <option value="remote">Remoto</option>
                    <option value="hybrid">Híbrido</option>
                    <option value="onSite">Presencial</option>
                  </select>
                  {errors.modality &&
                    <span>{errors.modality.message}</span>}
                </div>

                <div className={styles.filterGroup}>
                  <label htmlFor="location">Localidad</label>
                  <select id="location"
                    {...register('locationId')}
                    defaultValue="">
                    <option value="">Todas</option>
                    {locations?.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {errors.locationId &&
                    <span>{errors.locationId.message}</span>}
                </div>

              </div>
            </form>
          </div>
        </section>

        {/* Listado de empleos */}
        <section className={styles.jobsPanel}>
          <div className={styles.jobsHeader}>
            <h2 className={styles.jobsTitle}>Empleos disponibles</h2>

            {/* Ordenar por: */}
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as JobQueryDto["sort"])}
              aria-label="Ordenar empleos"
            >
              <option value="recent">Más recientes</option>
              <option value="alphabetical">Orden alfabético</option>
              <option value="popular">Más populares</option>
            </select>
          </div>

          {!empty && data ? (
            <div className={styles.jobsList}>
              {data.jobs.map(job => (
                <article key={job.id} className={styles.jobCard}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className={styles.jobLink}
                  >
                    <h3 className={styles.jobName}>
                      {job.title}
                    </h3>

                    <span className={styles.username}>
                      {job.username}
                    </span>

                    <p className={styles.jobDetails}>
                      <span className={styles.location}>
                        <span aria-hidden="true">📍</span>
                        {job.locationName}
                      </span>
                      <span>{modalityLabels[job.modality]}</span>
                      <span>{scheduleLabels[job.schedule]}</span>
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No hay empleos disponibles.</p>
            </div>
          )}

          {/* boton Ver más */}
          {hasNextPage && (
            <button
              type="button"
              onClick={handleLoadMore}
              className={styles.loadMoreButton}
              disabled={loadingMore}
            >
              {loadingMore ? "Cargando..." : "Ver más"}
            </button>
          )}
        </section>

      </div>
    </main>
  )
}
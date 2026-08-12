import { JobQuerySchema } from "./schemas/job/job.query.schema"


export const validateQueryParams = (searchParams: URLSearchParams) => {

    const parsed = JobQuerySchema.safeParse({
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        locationId: searchParams.get("locationId") ?? undefined,
        schedule: searchParams.get("schedule") ?? undefined,
        modality: searchParams.get("modality")?? undefined,
        sort: searchParams.get("sort") ?? undefined
    })

    if (!parsed.success) {
        return {
            ok: false,
            error: parsed.error.flatten().fieldErrors,
            status: 400
        }
    }

    return {
        ok: true,
        data: parsed.data
    }
}
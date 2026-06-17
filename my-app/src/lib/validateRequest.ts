import {ZodTypeAny, infer as zInfer } from "zod"

export const validateRequest = async <S extends ZodTypeAny>(req:Request, schema:S) => {
    const data = await req.json()

    const parsed = schema.safeParse(data)
    if(!parsed.success) {
        return {
            ok:false,
            error: parsed.error.flatten().fieldErrors,
            status: 400
        }
    }

    return {
        ok: true,
        data: parsed.data
    }

}
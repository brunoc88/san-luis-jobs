const handleResponse = async (res:Response) => {
    const body = await res.json()

     if (!res.ok) {
        return {
            ok: false,
            status: res.status,
            error: body.error
        }
    }

    return {
        ok: true,
        status: res.status,
        data: body
    }
}

export default handleResponse
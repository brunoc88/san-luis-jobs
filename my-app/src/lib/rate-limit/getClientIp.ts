export const getClientIp = (
  headers: Record<string, any> | Headers | undefined
) => {
  const forwardedFor =
    headers instanceof Headers
      ? headers.get("x-forwarded-for")
      : headers?.["x-forwarded-for"]

  if (!forwardedFor) {
    return null
  }

  const clientIp = forwardedFor.split(",")[0].trim()

  return clientIp
}
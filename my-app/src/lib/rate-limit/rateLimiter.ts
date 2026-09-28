type RateLimitEntry = {
  count: number
  startTime: number
}

const requests = new Map<string, RateLimitEntry>()

export const rateLimiter = (
  key: string,
  limit: number,
  windowMs: number
): boolean => {
  const now = Date.now()
  const entry = requests.get(key)

  if (!entry) {
    requests.set(key, {
      count: 1,
      startTime: now
    })

    return true
  }

  const windowExpired = now - entry.startTime >= windowMs

  if (windowExpired) {
    requests.set(key, {
      count: 1,
      startTime: now
    })

    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++

  return true
}
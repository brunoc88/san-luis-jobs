import { describe, it, expect } from "vitest"
import { getClientIp } from "@/lib/rate-limit/getClientIp"

describe("getClientIp", () => {

  it("returns the client IP from x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "192.168.1.10"
    })

    expect(getClientIp(headers)).toBe("192.168.1.10")
  })

  it("returns the first IP when x-forwarded-for contains multiple IPs", () => {
    const headers = new Headers({
      "x-forwarded-for": "192.168.1.10, 10.0.0.1"
    })

    expect(getClientIp(headers)).toBe("192.168.1.10")
  })

  it("returns null when x-forwarded-for is missing", () => {
    const headers = new Headers()

    expect(getClientIp(headers)).toBeNull()
  })

})
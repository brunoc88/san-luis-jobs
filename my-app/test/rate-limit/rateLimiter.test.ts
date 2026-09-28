import { describe, it, expect, vi } from "vitest"

import { rateLimiter } from "@/lib/rate-limit/rateLimiter"

describe("rateLimiter", () => {

    it("allows the first request", () => {
        const result = rateLimiter("192.168.1.1", 5, 60_000)

        expect(result).toBe(true)
    })

    it("rejects requests after reaching the limit", () => {
        const key = "192.168.1.2"

        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)

        expect(rateLimiter(key, 5, 60_000)).toBe(false)
    })

    it("resets the counter when the window expires", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-09-28T10:00:00"))

        const key = "192.168.1.3"

        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)
        expect(rateLimiter(key, 5, 60_000)).toBe(true)

        expect(rateLimiter(key, 5, 60_000)).toBe(false)

        vi.setSystemTime(new Date("2026-09-28T10:01:01"))

        expect(rateLimiter(key, 5, 60_000)).toBe(true)

        vi.useRealTimers()
    })

    it("keeps separate counters for different IPs", () => {
        const ip1 = "192.168.1.10"
        const ip2 = "192.168.1.11"

        expect(rateLimiter(ip1, 2, 60_000)).toBe(true)
        expect(rateLimiter(ip1, 2, 60_000)).toBe(true)

        // IP1 alcanzó su límite
        expect(rateLimiter(ip1, 2, 60_000)).toBe(false)

        // IP2 tiene su propio contador
        expect(rateLimiter(ip2, 2, 60_000)).toBe(true)
    })
})
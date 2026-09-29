export const rateLimitConfig = {
  login: {
    ip: {
      limit: 5,
      windowMs: 60_000
    }
  },

  passwordRecovery: {
    ip: {
      limit: 5,
      windowMs: 60_000
    },
    email: {
      limit: 3,
      windowMs: 15 * 60_000
    }
  },

  // otros endpoints...
}
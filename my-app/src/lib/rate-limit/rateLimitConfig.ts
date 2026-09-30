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

  resetPassword: {
    ipGET: {
      limit: 10,
      windowMs: 60_000
    },
    ipPOST: {
      limit: 5,
      windowMs: 60_000
    },
    token: {
      limit: 3,
      windowMs: 15 * 60_000
    }
  },

  createJob: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  editJob: {
    user: {
      limit: 20,
      windowMs: 60 * 60 * 1000
    }
  },

  applyJob: {
    user: {
      limit: 20,
      windowMs: 60 * 60 * 1000
    }
  },

  saveJob: {
    user: {
      limit: 30,
      windowMs: 60 * 60 * 1000
    }
  },

  unsaveJob: {
    user: {
      limit: 30,
      windowMs: 60 * 60 * 1000
    }
  },

  reportJob: {
    user: {
      limit: 5,
      windowMs: 60 * 60 * 1000
    }
  },

  deleteJob: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  changeJobStatus: {
    user: {
      limit: 20,
      windowMs: 60 * 60 * 1000
    }
  },

  suspendJob: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  }

}
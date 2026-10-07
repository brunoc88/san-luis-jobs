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
  },

  listJobs: {
    ip: {
      limit: 60,
      windowMs: 60 * 1000
    }
  },

  getJobDetails: {
    ip: {
      limit: 60,
      windowMs: 60 * 1000
    }
  },

  listComplaints: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  getComplaint: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  deleteComplaint: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  createFeedback: {
    user: {
      limit: 5,
      windowMs: 60 * 60 * 1000
    }
  },

  getAllFeedbacks: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  getFeedback: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  deleteFeedback: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  getAllLocations: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  getAllActiveLocations: {
    user: {
      limit: 60,
      windowMs: 60 * 1000
    }
  },

  createLocation: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  renameLocation: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  toggleLocationStatus: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  listUsers: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  activateUser: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    },
    email: {
      limit: 3,
      windowMs: 15 * 60 * 1000
    }
  },

  toggleUserRole: {
    user: {
      limit: 5,
      windowMs: 60 * 60 * 1000
    },
    email: {
      limit: 3,
      windowMs: 15 * 60 * 1000
    }
  },

  activateSuspendedAccount: {
    user: {
      limit: 5,
      windowMs: 60 * 60 * 1000
    },
    email: {
      limit: 3,
      windowMs: 15 * 60 * 1000
    }
  },

  getUserAudit: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  deactivateMyAccount: {
    user: {
      limit: 5,
      windowMs: 60 * 60 * 1000
    }
  },

  changePassword: {
    user: {
      limit: 5,
      windowMs: 60 * 60 * 1000
    }
  },

  changePrivacy: {
    user: {
      limit: 20,
      windowMs: 60 * 60 * 1000
    }
  },

  changeUsername: {
    user: {
      limit: 10,
      windowMs: 60 * 60 * 1000
    }
  },

  changeEmail: {
    user: {
      limit: 5,
      windowMs: 60 * 60 * 1000
    },
    email: {
      limit: 3,
      windowMs: 15 * 60 * 1000
    }
  },

  changeEmailVerify: {
    ip: {
      limit: 10,
      windowMs: 60 * 1000
    },
    token: {
      limit: 3,
      windowMs: 15 * 60 * 1000
    }
  },

  listSuspendedUsers: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  getUserInfo: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  getUserJobs: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  getUserSavedJobs: {
    user: {
      limit: 30,
      windowMs: 60 * 1000
    }
  },

  createUser: {
    ip: {
      limit: 3,
      windowMs: 60 * 60 * 1000
    }
  }
}
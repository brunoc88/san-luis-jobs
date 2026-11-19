import { loadUsers } from "./fake.user"
import { loadJobs } from "./fakeJobs"
import { loadLocations } from "./dummy.locations"
import clearTestDb from "./clearTestDb"
import { loadComplaints } from "./fake.complaints"

const loadDb = async () => {
    await clearTestDb()
    await loadJobs()
    await loadComplaints()
}

const main = async () => {
    await loadDb()
}

main()
    .catch(console.error)
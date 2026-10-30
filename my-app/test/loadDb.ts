import { loadUsers } from "./fake.user"
import { loadJobs } from "./fakeJobs"
import { loadLocations } from "./dummy.locations"
import clearTestDb from "./clearTestDb"

const loadDb = async () => {
    await clearTestDb()
    await loadJobs()
}

const main = async () => {
    await loadDb()
}

main()
    .catch(console.error)
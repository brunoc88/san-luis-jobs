import AdminPanel from "@/components/auth/admin/AdminPanel"
import AdminOnly from "@/components/auth/AdminOnly"
import { useEffect } from "react"

const LocationsListPage = () => {

    useEffect(() => {
        const loadLocations = async () => {
            try {
                
            } catch (error) {
                
            }
        }
        loadLocations()
    }, [])

    return (
        <div>
            <AdminOnly>
                <AdminPanel 
                mode = 'locations'
                dataDB={}
                />
            </AdminOnly>
        </div>
    )
}

export default LocationsListPage
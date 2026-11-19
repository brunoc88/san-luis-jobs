'use client'

import LocationsPanel from "@/components/auth/admin/LocationsPanel"
import AdminOnly from "@/components/auth/AdminOnly"
import { locationApi } from "@/lib/api/location/location"
import { Locations } from "@/types/location/location.types"
import { useEffect, useState } from "react"

const LocationsListPage = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [locations, setLocations] = useState<Locations>([])

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const res = await locationApi.getAllLocations()
                if(res.ok){
                    setLocations(res.data.locations)
                }
            } catch (error) {
                console.log(error)
            } finally{
                setLoading(false)
            }
        }
        loadLocations()
    }, [])

    if(loading) return <p>Cargando...</p>
    return (
        <AdminOnly>
            <LocationsPanel 
                locations={locations}
            />
        </AdminOnly>
    )
}

export default LocationsListPage
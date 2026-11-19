import { Locations } from "@/types/location/location.types"

type LocationsPanelProps = {
    locations: Locations
}

const LocationsPanel = ({ locations }: LocationsPanelProps) => {
    return (
        <div>
            <div>
                Listado de locaciones
            </div>
            <div>
                <form action="">
                    <input
                        placeholder="Ingrese un nombre de locacion"
                        type="text" name="" id="" />
                    <button>Crear</button>
                </form>
            </div>
            <div>
                <input
                    placeholder="Buscar..."
                    type="text" />
            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map(l => (
                            <tr key={l.id}>
                                <td>{l.id}</td>
                                <td>{l.name}</td>
                                <td>{l.isActive ? 'Activa' : 'Inactiva'}</td>
                                <div>
                                    <button>Editar</button>
                                    <button>Eliminar</button>
                                </div>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default LocationsPanel
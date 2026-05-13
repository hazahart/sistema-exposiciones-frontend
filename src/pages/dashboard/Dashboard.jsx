import {useEffect, useState} from 'react'
import {BookOpen, Users, Presentation, CheckCircle, Loader2, AlertCircle} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {getDashboardStats} from '../../api/dashboard.api'

export default function Dashboard() {
    const {alumno} = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState({
        materias_activas: 0,
        grupos_totales: 0,
        exposiciones: 0,
        evaluadas: 0,
        proximas_exposiciones: []
    })

    useEffect(() => {
        if (!alumno?.id_alumno) return
        const fetchStats = async () => {
            try {
                setLoading(true)
                setError(null)
                const stats = await getDashboardStats(alumno.id_alumno)
                setData(stats)
            } catch {
                setError('No se pudieron cargar las estadísticas.')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [alumno])

    const statsConfig = [
        {label: 'Materias', value: data.materias_activas, icon: BookOpen, color: 'bg-blue-500'},
        {label: 'Grupos', value: data.grupos_totales, icon: Users, color: 'bg-purple-500'},
        {label: 'Exposiciones', value: data.exposiciones, icon: Presentation, color: 'bg-amber-500'},
        {label: 'Evaluadas', value: data.evaluadas, icon: CheckCircle, color: 'bg-green-500'},
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Loader2 className="animate-spin mb-2 text-green-600" size={40}/>
                <p className="animate-pulse">Cargando datos...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center shadow-sm">
                <AlertCircle className="mr-3"/>
                {error}
            </div>
        )
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Bienvenido de nuevo, <span className="text-green-600">{alumno?.nombre || 'Estudiante'}</span>
                </h1>
                <p className="text-gray-500">Resumen actual del sistema de exposiciones.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {statsConfig.map((item) => (
                    <div key={item.label}
                         className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`${item.color} p-3 rounded-lg text-white`}>
                                    <item.icon size={24}/>
                                </div>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Próximas Exposiciones</h3>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
            Próximos 7 días
          </span>
                </div>

                {data.proximas_exposiciones.length > 0 ? (
                    <div className="space-y-4">
                        {data.proximas_exposiciones.map((expo) => (
                            <div key={expo.id_exposicion}
                                 className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border-l-4 border-l-green-500 border border-gray-50">
                                <div className="bg-green-50 text-green-600 p-3 rounded-lg mr-4">
                                    <Presentation size={20}/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{expo.tema}</p>
                                    <p className="text-sm text-gray-500 capitalize">
                                        {new Date(expo.fecha_programada).toLocaleDateString('es-MX', {
                                            weekday: 'long', day: 'numeric', month: 'long'
                                        })}
                                    </p>
                                </div>
                                <span
                                    className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full">Pendiente</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <Presentation size={48} className="mx-auto mb-4 opacity-10"/>
                        <p className="text-sm">No tienes exposiciones pendientes en los próximos 7 días.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
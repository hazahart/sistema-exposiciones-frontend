import {useState, useEffect, useCallback} from 'react'
import {
    ClipboardCheck,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    Star,
    Calculator
} from 'lucide-react'
import {toast} from 'sonner'
import {useAuth} from '../../context/AuthContext'
import {getEvaluaciones, createEvaluacion, deleteEvaluacion} from '../../api/evaluaciones.api'
import {getExposiciones} from '../../api/exposiciones.api'
import {getCriterios} from '../../api/criterios.api'

export default function Evaluaciones() {
    const {alumno, isAdmin} = useAuth()

    const [evaluaciones, setEvaluaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const SIZE = 10

    const [modalOpen, setModalOpen] = useState(false)
    const [exposiciones, setExposiciones] = useState([])
    const [criterios, setCriterios] = useState([])
    const [selectedExpo, setSelectedExpo] = useState('')
    const [calificaciones, setCalificaciones] = useState({})
    const [formLoading, setFormLoading] = useState(false)
    const [loadingModal, setLoadingModal] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [detalleTarget, setDetalleTarget] = useState(null)

    const fetchEvaluaciones = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getEvaluaciones(page, SIZE)
            setEvaluaciones(data.content)
            setTotalPages(data.totalPages)
            setTotalElements(data.totalElements)
        } catch {
            setError('No se pudieron cargar las evaluaciones.')
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        fetchEvaluaciones()
    }, [fetchEvaluaciones])

    const openModal = async () => {
        setLoadingModal(true)
        setModalOpen(true)
        setSelectedExpo('')
        setCalificaciones({})
        try {
            const [exposData, criteriosData] = await Promise.all([
                getExposiciones(0, 100),
                getCriterios()
            ])
            const pendientes = exposData.content.filter(e => e.estado === 'pendiente')
            setExposiciones(pendientes)
            setCriterios(criteriosData)
            const iniciales = {}
            criteriosData.forEach(c => {
                iniciales[c.id_criterio] = ''
            })
            setCalificaciones(iniciales)
        } catch {
            toast.error('Error al cargar datos para evaluar')
            setModalOpen(false)
        } finally {
            setLoadingModal(false)
        }
    }

    const closeModal = () => {
        setModalOpen(false)
        setSelectedExpo('')
        setCalificaciones({})
    }

    const handleCalificacion = (id_criterio, value) => {
        const num = parseFloat(value)
        if (value === '' || (num >= 0 && num <= 10)) {
            setCalificaciones(prev => ({...prev, [id_criterio]: value}))
        }
    }

    const calcularFinal = () => {
        if (!criterios.length) return 0
        return criterios.reduce((total, c) => {
            const cal = parseFloat(calificaciones[c.id_criterio]) || 0
            return total + (cal * c.peso_porcentaje / 100)
        }, 0).toFixed(2)
    }

    const todosCalificados = () =>
        criterios.every(c => calificaciones[c.id_criterio] !== '' && calificaciones[c.id_criterio] !== undefined)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedExpo) {
            toast.error('Selecciona una exposición')
            return
        }
        if (!todosCalificados()) {
            toast.error('Debes calificar todos los criterios')
            return
        }
        setFormLoading(true)
        try {
            const detalles = criterios.map(c => ({
                id_criterio: c.id_criterio,
                calificacion: parseFloat(calificaciones[c.id_criterio])
            }))
            await createEvaluacion({
                id_exposicion: parseInt(selectedExpo),
                id_alumno_evaluador: alumno.id_alumno,
                detalles
            })
            toast.success(`Evaluación registrada — Calificación final: ${calcularFinal()}`)
            closeModal()
            fetchEvaluaciones()
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrar la evaluación'
            toast.error(msg)
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            await deleteEvaluacion(deleteTarget.id_evaluacion)
            toast.success('Evaluación eliminada correctamente')
            setDeleteTarget(null)
            if (evaluaciones.length === 1 && page > 0) setPage(page - 1)
            else fetchEvaluaciones()
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al eliminar la evaluación'
            toast.error(msg)
        } finally {
            setDeleteLoading(false)
        }
    }

    const getCalColor = (cal) => {
        if (cal >= 9) return 'text-green-600'
        if (cal >= 7) return 'text-amber-600'
        return 'text-red-600'
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardCheck className="text-green-600" size={26}/>
                        Evaluaciones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {totalElements} {totalElements === 1 ? 'evaluación registrada' : 'evaluaciones registradas'}
                    </p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                    <Plus size={18}/>
                    Evaluar exposición
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <Loader2 className="animate-spin mr-2 text-green-600" size={28}/>
                        <span>Cargando evaluaciones...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-48 text-red-500 gap-2">
                        <AlertCircle size={20}/>
                        <span>{error}</span>
                    </div>
                ) : evaluaciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <ClipboardCheck size={40} className="mb-3 opacity-20"/>
                        <p className="text-sm">No hay evaluaciones registradas</p>
                        <p className="text-xs mt-1">Evalúa una exposición usando el botón de arriba</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exposición</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evaluador</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Calificación</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {evaluaciones.map((ev) => (
                                <tr key={ev.id_evaluacion} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-800 font-medium">
                                        Exposición #{ev.id_exposicion}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        Alumno #{ev.id_alumno_evaluador}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(ev.fecha_registro).toLocaleDateString('es-MX', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                    <span className={`text-xl font-black ${getCalColor(ev.calificacion_final)}`}>
                      {ev.calificacion_final}
                    </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setDetalleTarget(ev)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                title="Ver detalles"
                                            >
                                                <Star size={15}/>
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setDeleteTarget(ev)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={15}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-sm text-gray-500">Página {page + 1} de {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={16}/> Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Siguiente <ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">Evaluar exposición</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20}/>
                            </button>
                        </div>

                        {loadingModal ? (
                            <div className="flex items-center justify-center h-32 text-gray-400">
                                <Loader2 className="animate-spin mr-2 text-green-600" size={24}/>
                                <span>Cargando datos...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Exposición a evaluar
                                    </label>
                                    {exposiciones.length === 0 ? (
                                        <div
                                            className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
                                            No tienes exposiciones pendientes de evaluar.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedExpo}
                                            onChange={(e) => setSelectedExpo(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                            required
                                        >
                                            <option value="">Selecciona una exposición</option>
                                            {exposiciones.map(expo => (
                                                <option key={expo.id_exposicion} value={expo.id_exposicion}>
                                                    {expo.tema}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {criterios.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Rúbrica de evaluación
                                        </label>
                                        <div className="space-y-3">
                                            {criterios.map((criterio) => (
                                                <div key={criterio.id_criterio}
                                                     className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-800">{criterio.descripcion}</p>
                                                        <p className="text-xs text-gray-400">Peso: {criterio.peso_porcentaje}%</p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            step="0.5"
                                                            value={calificaciones[criterio.id_criterio] ?? ''}
                                                            onChange={(e) => handleCalificacion(criterio.id_criterio, e.target.value)}
                                                            placeholder="0-10"
                                                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {todosCalificados() && criterios.length > 0 && (
                                    <div
                                        className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
                                        <div className="flex items-center gap-2 text-green-700 font-medium">
                                            <Calculator size={18}/>
                                            Calificación final ponderada
                                        </div>
                                        <span className="text-2xl font-black text-green-700">{calcularFinal()}</span>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={formLoading}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading || exposiciones.length === 0}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
                                    >
                                        {formLoading && <Loader2 size={16} className="animate-spin"/>}
                                        Registrar evaluación
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {detalleTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">Detalle de evaluación</h2>
                            <button onClick={() => setDetalleTarget(null)}
                                    className="text-gray-400 hover:text-gray-600">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="space-y-3 mb-5">
                            {detalleTarget.detalles?.map((d) => (
                                <div key={d.id_criterio}
                                     className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{d.descripcion}</p>
                                        <p className="text-xs text-gray-400">Peso: {d.peso_porcentaje}%</p>
                                    </div>
                                    <span className={`text-xl font-black ${getCalColor(d.calificacion)}`}>
                    {d.calificacion}
                  </span>
                                </div>
                            ))}
                        </div>

                        <div
                            className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
                            <span className="text-green-700 font-medium">Calificación final</span>
                            <span className={`text-2xl font-black ${getCalColor(detalleTarget.calificacion_final)}`}>
                {detalleTarget.calificacion_final}
              </span>
                        </div>

                        <button
                            onClick={() => setDetalleTarget(null)}
                            className="w-full mt-4 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-2 rounded-lg">
                                <Trash2 className="text-red-600" size={20}/>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Eliminar evaluación</h2>
                        </div>
                        <p className="text-gray-600 mb-5">
                            ¿Estás seguro de eliminar la evaluación de la exposición #{deleteTarget.id_exposicion}?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
                            >
                                {deleteLoading && <Loader2 size={16} className="animate-spin"/>}
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
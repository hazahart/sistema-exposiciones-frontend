import {useState, useEffect, useCallback} from 'react'
import {
    Presentation,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users
} from 'lucide-react'
import {toast} from 'sonner'
import {useAuth} from '../../context/AuthContext'
import {getExposiciones, createExposicion, updateExposicion, deleteExposicion} from '../../api/exposiciones.api'
import apiClient from '../../api/apiClient'

const EMPTY_FORM = {tema: '', fecha_programada: '', id_equipo: ''}

const ESTADO_BADGE = {
    propia: 'bg-blue-50 text-blue-700',
    evaluada: 'bg-green-50 text-green-700',
    pendiente: 'bg-amber-50 text-amber-700',
}

const ESTADO_LABEL = {
    propia: 'Tu exposición',
    evaluada: 'Ya evaluada',
    pendiente: 'Pendiente',
}

const formatFechaCorta = (fecha) =>
    new Date(fecha).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

const toInputDatetime = (fecha) => {
    if (!fecha) return ''
    return new Date(fecha).toISOString().slice(0, 16)
}

export default function Exposiciones() {
    const {isAdmin} = useAuth()

    const [exposiciones, setExposiciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const SIZE = 10

    const [equipos, setEquipos] = useState([])

    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formLoading, setFormLoading] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchExposiciones = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getExposiciones(page, SIZE)
            setExposiciones(data.content)
            setTotalPages(data.totalPages)
            setTotalElements(data.totalElements)
        } catch {
            setError('No se pudieron cargar las exposiciones.')
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        fetchExposiciones()
    }, [fetchExposiciones])

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const res = await apiClient.get('/equipos', {params: {size: 100}})
                setEquipos(res.data.content || [])
            } catch {
            }
        }
        fetchEquipos()
    }, [])

    const getNombreEquipo = (id) => {
        const eq = equipos.find(e => e.id_equipo === id)
        return eq ? eq.nombre_equipo : `Equipo #${id}`
    }

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setModalOpen(true)
    }

    const openEdit = (expo) => {
        setEditing(expo)
        setForm({tema: expo.tema, fecha_programada: toInputDatetime(expo.fecha_programada), id_equipo: expo.id_equipo})
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setForm(EMPTY_FORM)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.tema.trim() || !form.fecha_programada || !form.id_equipo) {
            toast.error('Todos los campos son requeridos')
            return
        }
        setFormLoading(true)
        try {
            const payload = {
                tema: form.tema,
                fecha_programada: new Date(form.fecha_programada).toISOString(),
                id_equipo: parseInt(form.id_equipo)
            }
            if (editing) {
                await updateExposicion(editing.id_exposicion, payload)
                toast.success('Exposición actualizada correctamente')
            } else {
                await createExposicion(payload)
                toast.success('Exposición programada correctamente')
            }
            closeModal()
            fetchExposiciones()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar la exposición')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            await deleteExposicion(deleteTarget.id_exposicion)
            toast.success('Exposición eliminada correctamente')
            setDeleteTarget(null)
            if (exposiciones.length === 1 && page > 0) setPage(page - 1)
            else fetchExposiciones()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar la exposición')
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Presentation className="text-green-600" size={26}/>
                        Exposiciones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {totalElements} {totalElements === 1 ? 'exposición registrada' : 'exposiciones registradas'}
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={openCreate}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                        <Plus size={18}/>Programar exposición
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <Loader2 className="animate-spin mr-2 text-green-600"
                                 size={28}/><span>Cargando exposiciones...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-48 text-red-500 gap-2">
                        <AlertCircle size={20}/><span>{error}</span>
                    </div>
                ) : exposiciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Presentation size={40} className="mb-3 opacity-20"/>
                        <p className="text-sm">No hay exposiciones registradas</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {exposiciones.map((expo) => (
                            <div key={expo.id_exposicion}
                                 className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="bg-green-50 text-green-600 p-3 rounded-xl flex-shrink-0">
                                    <Presentation size={20}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{expo.tema}</p>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar
                                            size={13}/>{formatFechaCorta(expo.fecha_programada)}</span>
                                        <span className="flex items-center gap-1"><Users
                                            size={13}/>{getNombreEquipo(expo.id_equipo)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap sm:flex-shrink-0">
                                    {expo.estado && (
                                        <span
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_BADGE[expo.estado]}`}>
                      {ESTADO_LABEL[expo.estado]}
                    </span>
                                    )}
                                    {isAdmin && (
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(expo)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Editar">
                                                <Pencil size={15}/>
                                            </button>
                                            <button onClick={() => setDeleteTarget(expo)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar">
                                                <Trash2 size={15}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-sm text-gray-500">Página {page + 1} de {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            <ChevronLeft size={16}/> Anterior
                        </button>
                        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            Siguiente <ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar exposición' : 'Programar exposición'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20}/>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                                <input type="text" value={form.tema}
                                       onChange={(e) => setForm(f => ({...f, tema: e.target.value}))}
                                       placeholder="Ej: Arquitectura de Microservicios"
                                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                       disabled={formLoading} required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                                <input type="datetime-local" value={form.fecha_programada}
                                       onChange={(e) => setForm(f => ({...f, fecha_programada: e.target.value}))}
                                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                       disabled={formLoading} required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
                                <select value={form.id_equipo}
                                        onChange={(e) => setForm(f => ({...f, id_equipo: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                        disabled={formLoading} required>
                                    <option value="">Selecciona un equipo</option>
                                    {equipos.map(eq => (
                                        <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} disabled={formLoading}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={formLoading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl disabled:opacity-60">
                                    {formLoading && <Loader2 size={16} className="animate-spin"/>}
                                    {editing ? 'Guardar cambios' : 'Programar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-2 rounded-lg"><Trash2 className="text-red-600" size={20}/>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Eliminar exposición</h2>
                        </div>
                        <p className="text-gray-600 mb-1">¿Estás seguro de eliminar la exposición:</p>
                        <p className="font-semibold text-gray-900 mb-4">{deleteTarget.tema}</p>
                        <p className="text-xs text-gray-400 mb-5">Si tiene evaluaciones asociadas no podrá
                            eliminarse.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} disabled={deleteLoading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl disabled:opacity-60">
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
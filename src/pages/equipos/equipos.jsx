import {useState, useEffect, useCallback} from 'react'
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    UserMinus
} from 'lucide-react'
import {toast} from 'sonner'
import {useAuth} from '../../context/AuthContext'
import {
    getEquipos,
    createEquipo,
    updateEquipo,
    deleteEquipo,
    addAlumnoToEquipo,
    removeAlumnoFromEquipo
} from '../../api/equipos.api'
import apiClient from '../../api/apiClient'

const EMPTY_FORM = {nombre_equipo: '', id_grupo: ''}

export default function Equipos() {
    const {isAdmin} = useAuth()

    const [equipos, setEquipos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const SIZE = 6

    const [grupos, setGrupos] = useState([])
    const [materias, setMaterias] = useState([])
    const [alumnos, setAlumnos] = useState([])

    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formLoading, setFormLoading] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [integrantesModal, setIntegrantesModal] = useState(null)
    const [addAlumnoId, setAddAlumnoId] = useState('')
    const [integrantesLoading, setIntegrantesLoading] = useState(false)

    const fetchEquipos = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getEquipos(page, SIZE)
            setEquipos(data.content)
            setTotalPages(data.totalPages)
            setTotalElements(data.totalElements)
        } catch {
            setError('No se pudieron cargar los equipos.')
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        fetchEquipos()
    }, [fetchEquipos])

    useEffect(() => {
        const fetchSelect = async () => {
            try {
                const [mRes, gRes] = await Promise.all([
                    apiClient.get('/materias', {params: {size: 100}}),
                    apiClient.get('/grupos', {params: {size: 100}})
                ])
                setMaterias(mRes.data.content || [])
                setGrupos(gRes.data.content || [])
                if (isAdmin) {
                    const aRes = await apiClient.get('/alumnos', {params: {size: 100}})
                    setAlumnos(aRes.data.content || [])
                }
            } catch {
            }
        }
        fetchSelect()
    }, [isAdmin])

    const getNombreMateria = (id_materia) => {
        const m = materias.find(m => m.id_materia === id_materia)
        return m ? `${m.clave_materia} — ${m.nombre_materia}` : `#${id_materia}`
    }

    const getLabelGrupo = (grupo) => {
        return `${grupo.nombre_grupo} · ${getNombreMateria(grupo.id_materia)}`
    }

    const openCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setModalOpen(true)
    }

    const openEdit = (equipo) => {
        setEditing(equipo)
        setForm({nombre_equipo: equipo.nombre_equipo, id_grupo: equipo.id_grupo})
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditing(null)
        setForm(EMPTY_FORM)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.nombre_equipo.trim() || !form.id_grupo) {
            toast.error('Todos los campos son requeridos')
            return
        }
        setFormLoading(true)
        try {
            const payload = {nombre_equipo: form.nombre_equipo, id_grupo: parseInt(form.id_grupo)}
            if (editing) {
                await updateEquipo(editing.id_equipo, payload)
                toast.success('Equipo actualizado correctamente')
            } else {
                await createEquipo(payload)
                toast.success('Equipo creado correctamente')
            }
            closeModal()
            fetchEquipos()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar el equipo')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            await deleteEquipo(deleteTarget.id_equipo)
            toast.success('Equipo eliminado correctamente')
            setDeleteTarget(null)
            if (equipos.length === 1 && page > 0) setPage(page - 1)
            else fetchEquipos()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar el equipo')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleAddAlumno = async () => {
        if (!addAlumnoId) return
        setIntegrantesLoading(true)
        try {
            await addAlumnoToEquipo(integrantesModal.id_equipo, parseInt(addAlumnoId))
            toast.success('Alumno agregado al equipo')
            setAddAlumnoId('')
            fetchEquipos()
            const updated = await apiClient.get(`/equipos/${integrantesModal.id_equipo}`)
            setIntegrantesModal(updated.data)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al agregar alumno')
        } finally {
            setIntegrantesLoading(false)
        }
    }

    const handleRemoveAlumno = async (id_alumno) => {
        setIntegrantesLoading(true)
        try {
            await removeAlumnoFromEquipo(integrantesModal.id_equipo, id_alumno)
            toast.success('Alumno removido del equipo')
            fetchEquipos()
            const updated = await apiClient.get(`/equipos/${integrantesModal.id_equipo}`)
            setIntegrantesModal(updated.data)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al remover alumno')
        } finally {
            setIntegrantesLoading(false)
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-green-600" size={26}/>
                        Equipos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {totalElements} {totalElements === 1 ? 'equipo registrado' : 'equipos registrados'}
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={openCreate}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                        <Plus size={18}/>
                        Nuevo equipo
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    <Loader2 className="animate-spin mr-2 text-green-600" size={28}/>
                    <span>Cargando equipos...</span>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-48 text-red-500 gap-2">
                    <AlertCircle size={20}/><span>{error}</span>
                </div>
            ) : equipos.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white rounded-xl border border-gray-100">
                    <Users size={40} className="mb-3 opacity-20"/>
                    <p className="text-sm">No hay equipos registrados</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipos.map((equipo) => (
                        <div key={equipo.id_equipo}
                             className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <div className="bg-green-50 text-green-600 p-2.5 rounded-xl">
                                    <Users size={20}/>
                                </div>
                                <div className="flex gap-1">
                                    {isAdmin && (
                                        <>
                                            <button onClick={() => setIntegrantesModal(equipo)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Gestionar integrantes">
                                                <UserPlus size={15}/>
                                            </button>
                                            <button onClick={() => openEdit(equipo)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Editar">
                                                <Pencil size={15}/>
                                            </button>
                                            <button onClick={() => setDeleteTarget(equipo)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar">
                                                <Trash2 size={15}/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1">{equipo.nombre_equipo}</h3>
                            <p className="text-xs text-gray-400 mb-3">
                                {getLabelGrupo(grupos.find(g => g.id_grupo === equipo.id_grupo) || {
                                    nombre_grupo: `Grupo #${equipo.id_grupo}`,
                                    id_materia: null
                                })}
                            </p>

                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Integrantes ({equipo.alumnos?.length || 0})
                                </p>
                                {equipo.alumnos?.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {equipo.alumnos.map(al => (
                                            <div key={al.id_alumno}
                                                 className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <div
                                                    className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold uppercase flex-shrink-0">
                                                    {al.nombre.charAt(0)}
                                                </div>
                                                <span className="truncate">{al.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Sin integrantes</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-1">
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
                            <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar equipo' : 'Nuevo equipo'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20}/>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del
                                    equipo</label>
                                <input type="text" value={form.nombre_equipo}
                                       onChange={(e) => setForm(f => ({...f, nombre_equipo: e.target.value}))}
                                       placeholder="Ej: Equipo Alpha"
                                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                       disabled={formLoading} required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                                <select value={form.id_grupo}
                                        onChange={(e) => setForm(f => ({...f, id_grupo: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                        disabled={formLoading} required>
                                    <option value="">Selecciona un grupo</option>
                                    {grupos.map(g => (
                                        <option key={g.id_grupo} value={g.id_grupo}>
                                            {g.nombre_grupo} · {getNombreMateria(g.id_materia)}
                                        </option>
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
                                    {editing ? 'Guardar cambios' : 'Crear equipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {integrantesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">Integrantes
                                — {integrantesModal.nombre_equipo}</h2>
                            <button onClick={() => setIntegrantesModal(null)}
                                    className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <select value={addAlumnoId} onChange={(e) => setAddAlumnoId(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm">
                                <option value="">Agregar alumno...</option>
                                {alumnos
                                    .filter(a => !integrantesModal.alumnos?.find(ia => ia.id_alumno === a.id_alumno))
                                    .map(a => (
                                        <option key={a.id_alumno} value={a.id_alumno}>{a.nombre}</option>
                                    ))}
                            </select>
                            <button onClick={handleAddAlumno} disabled={!addAlumnoId || integrantesLoading}
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl disabled:opacity-60">
                                {integrantesLoading ? <Loader2 size={16} className="animate-spin"/> :
                                    <UserPlus size={16}/>}
                            </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {integrantesModal.alumnos?.length > 0 ? (
                                integrantesModal.alumnos.map(al => (
                                    <div key={al.id_alumno}
                                         className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-7 h-7 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold uppercase">
                                                {al.nombre.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{al.nombre}</span>
                                        </div>
                                        <button onClick={() => handleRemoveAlumno(al.id_alumno)}
                                                disabled={integrantesLoading}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                            <UserMinus size={15}/>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-400 py-4">Sin integrantes aún</p>
                            )}
                        </div>
                        <button onClick={() => setIntegrantesModal(null)}
                                className="w-full mt-4 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
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
                            <div className="bg-red-100 p-2 rounded-lg"><Trash2 className="text-red-600" size={20}/>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Eliminar equipo</h2>
                        </div>
                        <p className="text-gray-600 mb-1">¿Estás seguro de eliminar:</p>
                        <p className="font-semibold text-gray-900 mb-4">{deleteTarget.nombre_equipo}</p>
                        <p className="text-xs text-gray-400 mb-5">Si tiene exposiciones asociadas no podrá
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
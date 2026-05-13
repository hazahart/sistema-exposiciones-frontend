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
    Search,
    UserPlus,
    UserMinus
} from 'lucide-react'
import {toast} from 'sonner'
import {useAuth} from '../../context/AuthContext'
import {
    getGrupos,
    createGrupo,
    updateGrupo,
    deleteGrupo,
    addAlumnoToGrupo,
    removeAlumnoFromGrupo
} from '../../api/grupos.api'
import apiClient from '../../api/apiClient'

const EMPTY_FORM = {nombre_grupo: '', id_materia: ''}

export default function Grupos() {
    const {isAdmin} = useAuth()

    const [grupos, setGrupos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const SIZE = 10

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

    const fetchGrupos = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getGrupos(page, SIZE)
            setGrupos(data.content)
            setTotalPages(data.totalPages)
            setTotalElements(data.totalElements)
        } catch {
            setError('No se pudieron cargar los grupos.')
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        fetchGrupos()
    }, [fetchGrupos])

    useEffect(() => {
        const fetchSelect = async () => {
            try {
                const [mRes, aRes] = await Promise.all([
                    apiClient.get('/materias', {params: {size: 100}}),
                    apiClient.get('/alumnos', {params: {size: 100}})
                ])
                setMaterias(mRes.data.content || [])
                setAlumnos(aRes.data.content || [])
            } catch {
            }
        }
        fetchSelect()
    }, [])

    const getNombreMateria = (id) => {
        const m = materias.find(m => m.id_materia === id)
        return m ? `${m.clave_materia} — ${m.nombre_materia}` : `Materia #${id}`
    }

    const filteredGrupos = grupos.filter(g =>
        g.nombre_grupo.toLowerCase().includes(search.toLowerCase())
    )

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchInput)
        setPage(0)
    }

    const openCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setModalOpen(true)
    }

    const openEdit = (grupo) => {
        setEditing(grupo)
        setForm({nombre_grupo: grupo.nombre_grupo, id_materia: grupo.id_materia})
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditing(null)
        setForm(EMPTY_FORM)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.nombre_grupo.trim() || !form.id_materia) {
            toast.error('Todos los campos son requeridos')
            return
        }
        setFormLoading(true)
        try {
            const payload = {nombre_grupo: form.nombre_grupo, id_materia: parseInt(form.id_materia)}
            if (editing) {
                await updateGrupo(editing.id_grupo, payload)
                toast.success('Grupo actualizado correctamente')
            } else {
                await createGrupo(payload)
                toast.success('Grupo creado correctamente')
            }
            closeModal()
            fetchGrupos()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar el grupo')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            await deleteGrupo(deleteTarget.id_grupo)
            toast.success('Grupo eliminado correctamente')
            setDeleteTarget(null)
            if (grupos.length === 1 && page > 0) setPage(page - 1)
            else fetchGrupos()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar el grupo')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleAddAlumno = async () => {
        if (!addAlumnoId) return
        setIntegrantesLoading(true)
        try {
            await addAlumnoToGrupo(integrantesModal.id_grupo, parseInt(addAlumnoId))
            toast.success('Alumno inscrito al grupo')
            setAddAlumnoId('')
            fetchGrupos()
            const updated = await apiClient.get(`/grupos/${integrantesModal.id_grupo}`)
            setIntegrantesModal(updated.data)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al inscribir alumno')
        } finally {
            setIntegrantesLoading(false)
        }
    }

    const handleRemoveAlumno = async (id_alumno) => {
        setIntegrantesLoading(true)
        try {
            await removeAlumnoFromGrupo(integrantesModal.id_grupo, id_alumno)
            toast.success('Alumno removido del grupo')
            fetchGrupos()
            const updated = await apiClient.get(`/grupos/${integrantesModal.id_grupo}`)
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
                        Grupos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {totalElements} {totalElements === 1 ? 'grupo registrado' : 'grupos registrados'}
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={openCreate}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                        <Plus size={18}/>
                        Nuevo grupo
                    </button>
                )}
            </div>

            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                           placeholder="Filtrar por nombre..."
                           className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"/>
                </div>
                <button type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all">
                    Buscar
                </button>
                {search && (
                    <button type="button" onClick={() => {
                        setSearch('');
                        setSearchInput('');
                        setPage(0)
                    }}
                            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                        <X size={16}/> Limpiar
                    </button>
                )}
            </form>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <Loader2 className="animate-spin mr-2 text-green-600" size={28}/>
                        <span>Cargando grupos...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-48 text-red-500 gap-2">
                        <AlertCircle size={20}/><span>{error}</span>
                    </div>
                ) : filteredGrupos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Users size={40} className="mb-3 opacity-20"/>
                        <p className="text-sm">No se encontraron grupos</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grupo</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Materia</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alumnos</th>
                            {isAdmin &&
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {filteredGrupos.map((grupo) => (
                            <tr key={grupo.id_grupo} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{grupo.nombre_grupo}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{getNombreMateria(grupo.id_materia)}</td>
                                <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
                      <Users size={14} className="text-green-500"/>
                        {grupo.alumnos?.length || 0}
                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setIntegrantesModal(grupo)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Gestionar alumnos">
                                                <UserPlus size={15}/>
                                            </button>
                                            <button onClick={() => openEdit(grupo)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Editar">
                                                <Pencil size={16}/>
                                            </button>
                                            <button onClick={() => setDeleteTarget(grupo)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-sm text-gray-500">Página {page + 1} de {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronLeft size={16}/> Anterior
                        </button>
                        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
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
                            <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar grupo' : 'Nuevo grupo'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20}/>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo</label>
                                <input type="text" value={form.nombre_grupo}
                                       onChange={(e) => setForm(f => ({...f, nombre_grupo: e.target.value}))}
                                       placeholder="Ej: Grupo A"
                                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                       disabled={formLoading} required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                                <select value={form.id_materia}
                                        onChange={(e) => setForm(f => ({...f, id_materia: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                        disabled={formLoading} required>
                                    <option value="">Selecciona una materia</option>
                                    {materias.map(m => (
                                        <option key={m.id_materia} value={m.id_materia}>
                                            {m.clave_materia} — {m.nombre_materia}
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
                                    {editing ? 'Guardar cambios' : 'Crear grupo'}
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
                            <h2 className="text-lg font-bold text-gray-900">Alumnos
                                — {integrantesModal.nombre_grupo}</h2>
                            <button onClick={() => setIntegrantesModal(null)}
                                    className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <select value={addAlumnoId} onChange={(e) => setAddAlumnoId(e.target.value)}
                                    className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm">
                                <option value="">Inscribir alumno...</option>
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
                                <p className="text-center text-sm text-gray-400 py-4">Sin alumnos inscritos</p>
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
                            <h2 className="text-lg font-bold text-gray-900">Eliminar grupo</h2>
                        </div>
                        <p className="text-gray-600 mb-1">¿Estás seguro de eliminar:</p>
                        <p className="font-semibold text-gray-900 mb-4">{deleteTarget.nombre_grupo}</p>
                        <p className="text-xs text-gray-400 mb-5">Si tiene equipos asociados no podrá eliminarse.</p>
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
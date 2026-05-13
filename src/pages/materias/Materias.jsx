import {useState, useEffect, useCallback} from 'react'
import {BookOpen, Plus, Search, Pencil, Trash2, Loader2, AlertCircle, X, ChevronLeft, ChevronRight} from 'lucide-react'
import {toast} from 'sonner'
import {useAuth} from '../../context/AuthContext'
import {getMaterias, createMateria, updateMateria, deleteMateria} from '../../api/materias.api'

const EMPTY_FORM = {clave_materia: '', nombre_materia: ''}

export default function Materias() {
    const {isAdmin} = useAuth()

    const [materias, setMaterias] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const SIZE = 10

    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formLoading, setFormLoading] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchMaterias = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getMaterias(page, SIZE, search)
            setMaterias(data.content)
            setTotalPages(data.totalPages)
            setTotalElements(data.totalElements)
        } catch {
            setError('No se pudieron cargar las materias.')
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => {
        fetchMaterias()
    }, [fetchMaterias])

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(0)
        setSearch(searchInput)
    }

    const openCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setModalOpen(true)
    }

    const openEdit = (materia) => {
        setEditing(materia)
        setForm({clave_materia: materia.clave_materia, nombre_materia: materia.nombre_materia})
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditing(null)
        setForm(EMPTY_FORM)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.clave_materia.trim() || !form.nombre_materia.trim()) {
            toast.error('Todos los campos son requeridos')
            return
        }
        setFormLoading(true)
        try {
            if (editing) {
                await updateMateria(editing.id_materia, form)
                toast.success('Materia actualizada correctamente')
            } else {
                await createMateria(form)
                toast.success('Materia creada correctamente')
            }
            closeModal()
            fetchMaterias()
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al guardar la materia'
            toast.error(msg)
        } finally {
            setFormLoading(false)
        }
    }

    const confirmDelete = (materia) => setDeleteTarget(materia)

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            await deleteMateria(deleteTarget.id_materia)
            toast.success('Materia eliminada correctamente')
            setDeleteTarget(null)
            if (materias.length === 1 && page > 0) setPage(page - 1)
            else fetchMaterias()
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al eliminar la materia'
            toast.error(msg)
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-green-600" size={26}/>
                        Materias
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {totalElements} {totalElements === 1 ? 'materia registrada' : 'materias registradas'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                        <Plus size={18}/>
                        Nueva materia
                    </button>
                )}
            </div>

            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all"
                >
                    Buscar
                </button>
                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearch('');
                            setSearchInput('');
                            setPage(0)
                        }}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        <X size={16}/> Limpiar
                    </button>
                )}
            </form>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <Loader2 className="animate-spin mr-2 text-green-600" size={28}/>
                        <span>Cargando materias...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-48 text-red-500 gap-2">
                        <AlertCircle size={20}/>
                        <span>{error}</span>
                    </div>
                ) : materias.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <BookOpen size={40} className="mb-3 opacity-20"/>
                        <p className="text-sm">No se encontraron materias</p>
                        {search && <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clave</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                                {isAdmin &&
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {materias.map((materia) => (
                                <tr key={materia.id_materia} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                    <span
                        className="inline-block bg-green-50 text-green-700 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg">
                      {materia.clave_materia}
                    </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 font-medium">{materia.nombre_materia}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(materia)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16}/>
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(materia)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-sm text-gray-500">
                        Página {page + 1} de {totalPages}
                    </p>
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
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editing ? 'Editar materia' : 'Nueva materia'}
                            </h2>
                            <button onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20}/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clave de materia
                                </label>
                                <input
                                    type="text"
                                    value={form.clave_materia}
                                    onChange={(e) => setForm(f => ({...f, clave_materia: e.target.value}))}
                                    placeholder="Ej: IDD-2504"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={formLoading}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de materia
                                </label>
                                <input
                                    type="text"
                                    value={form.nombre_materia}
                                    onChange={(e) => setForm(f => ({...f, nombre_materia: e.target.value}))}
                                    placeholder="Ej: Tópicos Avanzados de Desarrollo Web"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={formLoading}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                                    disabled={formLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
                                >
                                    {formLoading && <Loader2 size={16} className="animate-spin"/>}
                                    {editing ? 'Guardar cambios' : 'Crear materia'}
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
                            <div className="bg-red-100 p-2 rounded-lg">
                                <Trash2 className="text-red-600" size={20}/>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Eliminar materia</h2>
                        </div>
                        <p className="text-gray-600 mb-1">
                            ¿Estás seguro de que deseas eliminar:
                        </p>
                        <p className="font-semibold text-gray-900 mb-5">
                            {deleteTarget.clave_materia} — {deleteTarget.nombre_materia}
                        </p>
                        <p className="text-xs text-gray-400 mb-5">
                            Esta acción no se puede deshacer. Si la materia tiene grupos asociados no podrá eliminarse.
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
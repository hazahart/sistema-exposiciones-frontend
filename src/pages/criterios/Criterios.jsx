import {useState, useEffect, useCallback} from 'react'
import {SlidersHorizontal, Plus, Pencil, Trash2, Loader2, AlertCircle, X} from 'lucide-react'
import {toast} from 'sonner'
import {useAuth} from '../../context/AuthContext'
import {getCriterios, createCriterio, updateCriterio, deleteCriterio} from '../../api/criterios.api'

const EMPTY_FORM = {descripcion: '', peso_porcentaje: ''}

export default function Criterios() {
    const {isAdmin} = useAuth()

    const [criterios, setCriterios] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formLoading, setFormLoading] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchCriterios = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getCriterios()
            setCriterios(data)
        } catch {
            setError('No se pudieron cargar los criterios.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCriterios()
    }, [fetchCriterios])

    const pesoTotal = criterios.reduce((sum, c) => sum + parseFloat(c.peso_porcentaje), 0)

    const openCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setModalOpen(true)
    }

    const openEdit = (criterio) => {
        setEditing(criterio)
        setForm({descripcion: criterio.descripcion, peso_porcentaje: criterio.peso_porcentaje})
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditing(null)
        setForm(EMPTY_FORM)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.descripcion.trim() || form.peso_porcentaje === '') {
            toast.error('Todos los campos son requeridos')
            return
        }
        const peso = parseFloat(form.peso_porcentaje)
        if (peso <= 0 || peso > 100) {
            toast.error('El peso debe ser mayor a 0 y máximo 100')
            return
        }
        const pesoOtros = criterios
            .filter(c => !editing || c.id_criterio !== editing.id_criterio)
            .reduce((sum, c) => sum + parseFloat(c.peso_porcentaje), 0)
        if (pesoOtros + peso > 100) {
            toast.error(`El peso total no puede superar 100%. Disponible: ${(100 - pesoOtros).toFixed(2)}%`)
            return
        }
        setFormLoading(true)
        try {
            if (editing) {
                await updateCriterio(editing.id_criterio, {descripcion: form.descripcion, peso_porcentaje: peso})
                toast.success('Criterio actualizado correctamente')
            } else {
                await createCriterio({descripcion: form.descripcion, peso_porcentaje: peso})
                toast.success('Criterio creado correctamente')
            }
            closeModal()
            fetchCriterios()
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al guardar el criterio'
            toast.error(msg)
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            await deleteCriterio(deleteTarget.id_criterio)
            toast.success('Criterio eliminado correctamente')
            setDeleteTarget(null)
            fetchCriterios()
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al eliminar el criterio'
            toast.error(msg)
        } finally {
            setDeleteLoading(false)
        }
    }

    const getPesoColor = (peso) => {
        if (peso >= 40) return 'bg-green-100 text-green-700'
        if (peso >= 20) return 'bg-amber-100 text-amber-700'
        return 'bg-blue-100 text-blue-700'
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <SlidersHorizontal className="text-green-600" size={26}/>
                        Criterios de evaluación
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {criterios.length} {criterios.length === 1 ? 'criterio definido' : 'criterios definidos'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                        <Plus size={18}/>
                        Nuevo criterio
                    </button>
                )}
            </div>

            {pesoTotal > 0 && (
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
                    pesoTotal === 100
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : pesoTotal > 100
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : 'bg-amber-50 border border-amber-200 text-amber-700'
                }`}>
                    <span>Peso total acumulado</span>
                    <span className="text-lg font-black">{pesoTotal.toFixed(2)}%</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <Loader2 className="animate-spin mr-2 text-green-600" size={28}/>
                        <span>Cargando criterios...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-48 text-red-500 gap-2">
                        <AlertCircle size={20}/>
                        <span>{error}</span>
                    </div>
                ) : criterios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <SlidersHorizontal size={40} className="mb-3 opacity-20"/>
                        <p className="text-sm">No hay criterios definidos</p>
                        {isAdmin && <p className="text-xs mt-1">Agrega criterios para habilitar las evaluaciones</p>}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Peso</th>
                            {isAdmin &&
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {criterios.map((criterio) => (
                            <tr key={criterio.id_criterio} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-800 font-medium">{criterio.descripcion}</td>
                                <td className="px-6 py-4 text-center">
                    <span
                        className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${getPesoColor(criterio.peso_porcentaje)}`}>
                      {criterio.peso_porcentaje}%
                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(criterio)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil size={16}/>
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(criterio)}
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
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editing ? 'Editar criterio' : 'Nuevo criterio'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20}/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <input
                                    type="text"
                                    value={form.descripcion}
                                    onChange={(e) => setForm(f => ({...f, descripcion: e.target.value}))}
                                    placeholder="Ej: Dominio del tema"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={formLoading}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Peso porcentual
                                    <span className="text-gray-400 font-normal ml-2">
                    (Disponible: {(100 - criterios
                                        .filter(c => !editing || c.id_criterio !== editing.id_criterio)
                                        .reduce((sum, c) => sum + parseFloat(c.peso_porcentaje), 0)).toFixed(2)}%)
                  </span>
                                </label>
                                <input
                                    type="number"
                                    min="0.01"
                                    max="100"
                                    step="0.01"
                                    value={form.peso_porcentaje}
                                    onChange={(e) => setForm(f => ({...f, peso_porcentaje: e.target.value}))}
                                    placeholder="Ej: 40"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={formLoading}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
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
                                    disabled={formLoading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
                                >
                                    {formLoading && <Loader2 size={16} className="animate-spin"/>}
                                    {editing ? 'Guardar cambios' : 'Crear criterio'}
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
                            <h2 className="text-lg font-bold text-gray-900">Eliminar criterio</h2>
                        </div>
                        <p className="text-gray-600 mb-1">¿Estás seguro de eliminar:</p>
                        <p className="font-semibold text-gray-900 mb-4">{deleteTarget.descripcion}</p>
                        <p className="text-xs text-gray-400 mb-5">
                            Si el criterio está en uso en evaluaciones existentes no podrá eliminarse.
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
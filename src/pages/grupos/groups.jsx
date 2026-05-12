import { useEffect, useState, useCallback } from 'react';
import { Search, Users, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGrupos } from '../../api/grupos.api'; // Ajusta la ruta según tu proyecto
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Paginación desde el Backend
  const [currentPage, setCurrentPage] = useState(0); // Supabase usa base 0
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchGrupos = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Llamada al API con parámetros de paginación
      const response = await getGrupos(currentPage, pageSize);
      
      // Según tu controlador: { content, page, size, totalElements, totalPages }
      setGrupos(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al conectar con el servidor de IT Celaya.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  // Filtrado local para la búsqueda rápida sobre la página actual
  const filteredGrupos = grupos.filter(grupo =>
    grupo.nombre_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && grupos.length === 0) return <LoadingScreen message="Cargando grupos..." />;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header - Se eliminó "Nuevo Grupo" */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-center md:text-left">
        <div className="w-full">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg text-green-700">
              <Users size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Listado de Grupos</h1>
          </div>
          <p className="text-gray-500">Consulta los grupos registrados y el total de alumnos inscritos.</p>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Filtrar por nombre en esta página..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
        </div>
        {loading && <Loader2 className="ml-4 animate-spin text-green-600" size={20} />}
      </div>

      {/* Manejo de Errores */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center shadow-sm">
          <AlertCircle className="mr-3" /> {errorMessage}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                <th className="p-4">ID</th>
                <th className="p-4">Nombre del Grupo</th>
                <th className="p-4">ID Materia</th>
                <th className="p-4">Alumnos</th>
                <th className="p-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGrupos.length > 0 ? (
                filteredGrupos.map((grupo) => (
                  <tr key={grupo.id_grupo} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 font-medium">#{grupo.id_grupo}</td>
                    <td className="p-4 text-gray-800 font-semibold">{grupo.nombre_grupo}</td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        MAT-{grupo.id_materia}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} className="text-green-600" />
                        <span className="font-medium">{grupo.alumnos?.length || 0} inscritos</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={48} className="text-gray-200 mb-2" />
                      <p>No se encontraron grupos disponibles.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Real */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando página <span className="text-gray-900">{currentPage + 1}</span> de <span className="text-gray-900">{totalPages}</span> ({totalElements} grupos totales)
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || loading}
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} className="mr-1" /> Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1 || loading}
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
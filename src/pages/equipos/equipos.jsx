import { useEffect, useState, useCallback } from 'react';
import { Users, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEquipos } from '../../api/equipos.api';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function EquiposPage() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Estados para Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const equiposPorPagina = 6;

  const fetchEquipos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEquipos();
      setEquipos(data.content || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("No se pudieron cargar los equipos. Verifica la conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  // Lógica de Paginación
  const indexOfLastEquipo = currentPage * equiposPorPagina;
  const indexOfFirstEquipo = indexOfLastEquipo - equiposPorPagina;
  const currentEquipos = equipos.slice(indexOfFirstEquipo, indexOfLastEquipo);
  const totalPages = Math.ceil(equipos.length / equiposPorPagina);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Mejora la experiencia al cambiar de página
  };

  if (loading) return <LoadingScreen message="Cargando equipos de IT Celaya..." />;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* HEADER CENTRADO */}
      <div className="flex flex-col items-center text-center mb-12 gap-2">
        <div className="bg-blue-50 p-4 rounded-full mb-2">
          <Users size={36} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Listado de Equipos
        </h1>
        <p className="text-gray-500 text-base max-w-md">
          Visualiza los equipos registrados y sus integrantes de manera organizada.
        </p>
        <div className="w-24 h-1 bg-blue-500 rounded-full mt-2"></div>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center shadow-sm">
          <AlertCircle className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* GRID DE EQUIPOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEquipos.length > 0 ? (
          currentEquipos.map((equipo) => (
            <div 
              key={equipo.id_equipo} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                  <Users size={24} />
                </div>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md uppercase tracking-wider">
                  ID Grupo: {equipo.id_grupo}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4">{equipo.nombre_equipo}</h3>
              
              <div className="space-y-2 mt-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Integrantes</p>
                {equipo.alumnos && equipo.alumnos.length > 0 ? (
                  <div className="space-y-1.5">
                    {equipo.alumnos.map(al => (
                      <div key={al.id_alumno} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center mr-2 font-bold uppercase">
                          {al.nombre.substring(0, 1)}
                        </div>
                        <span className="truncate">{al.nombre}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">Sin integrantes asignados</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Users className="mx-auto text-gray-300 mb-4" size={56} />
            <p className="text-gray-500 text-lg font-medium">No se encontraron equipos registrados.</p>
          </div>
        )}
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {equipos.length > equiposPorPagina && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border bg-white text-gray-600 disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
          >
            <ChevronLeft size={22} />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`w-11 h-11 rounded-xl font-bold transition-all active:scale-90 ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border bg-white text-gray-600 disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
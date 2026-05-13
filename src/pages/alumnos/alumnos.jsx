import { useState, useEffect } from 'react';
import { getAlumnos } from '../../api/alumnos.api';

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const fetchAlumnos = async (currentPage) => {
    try {
      setLoading(true);
      const data = await getAlumnos(currentPage, size);
      setAlumnos(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (_err) {
      setError("No se pudo cargar la lista de alumnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos(page);
  }, [page]);

  if (loading && alumnos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-8">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Directorio de Alumnos</h1>
            <p className="text-blue-100 text-lg opacity-90">Gestión centralizada de expedientes estudiantiles</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-center">
            <span className="block text-blue-200 text-xs uppercase font-bold tracking-widest">Registros Totales</span>
            <span className="text-3xl font-black">{totalElements}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 shadow-md flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Tabla Expandida */}
      <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b">No. Control</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Nombre Completo</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Correo Institucional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alumnos.map((alumno) => (
                <tr key={alumno.id_alumno} className="hover:bg-blue-50/40 transition-all duration-200 group">
                  <td className="px-8 py-6">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-black border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {alumno.no_control || alumno.matricula || '---'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-800 text-lg">{alumno.nombre} {alumno.apellido}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-gray-600 font-medium">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      {alumno.email || alumno.correo}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 bg-gray-50/50 p-6 rounded-2xl">
        <button
          disabled={page === 0 || loading}
          onClick={() => setPage(p => p - 1)}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-100 transition-all shadow-sm"
        >
          Anterior
        </button>
        <span className="text-gray-500 font-medium">
          Página <span className="text-blue-600 font-black">{page + 1}</span> de <span className="text-gray-800 font-black">{totalPages}</span>
        </span>
        <button
          disabled={page >= totalPages - 1 || loading}
          onClick={() => setPage(p => p + 1)}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-100 transition-all shadow-sm"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Alumnos;
import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react';

// Estos datos simulan la respuesta
const mockGrupos = [
  {
    id_grupo: 1,
    nombre_grupo: "Grupo A - Sistemas",
    id_materia: 1,
    alumnos: [{ id_alumno: 1, nombre: "Juan Pérez" }, { id_alumno: 2, nombre: "Ana Gómez" }]
  },
  {
    id_grupo: 2,
    nombre_grupo: "Grupo B - Redes",
    id_materia: 2,
    alumnos: [{ id_alumno: 3, nombre: "Carlos Ruiz" }]
  },
  {
    id_grupo: 3,
    nombre_grupo: "Grupo C - Bases de Datos",
    id_materia: 3,
    alumnos: []
  }
];

export default function Grupos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [grupos, setGrupos] = useState(mockGrupos);

  // Simulación de filtrado (búsqueda local por ahora)
  const filteredGrupos = grupos.filter(grupo => 
    grupo.nombre_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      
      {/* Header de la vista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Grupos</h1>
          <p className="text-gray-500">Administra los grupos, sus materias y alumnos inscritos.</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md">
          <Plus size={20} />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {/* Barra de herramientas (Búsqueda y Filtros) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre de grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Tabla de Grupos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                <th className="p-4">ID</th>
                <th className="p-4">Nombre del Grupo</th>
                <th className="p-4">ID Materia</th>
                <th className="p-4">Alumnos</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGrupos.length > 0 ? (
                filteredGrupos.map((grupo) => (
                  <tr key={grupo.id_grupo} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 font-medium">#{grupo.id_grupo}</td>
                    <td className="p-4 text-gray-800 font-semibold">{grupo.nombre_grupo}</td>
                    <td className="p-4 text-gray-600">Materia {grupo.id_materia}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{grupo.alumnos.length} inscritos</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-800 transition-colors" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* Estado Vacío (Empty State) */
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No se encontraron grupos que coincidan con tu búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación simple (Visual) */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {filteredGrupos.length} de {grupos.length} resultados</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>

    </div>
  );
}
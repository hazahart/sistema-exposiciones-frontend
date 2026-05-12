import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * DashboardLayout - Componente estructural principal.
 * Proporciona el Sidebar responsivo, el Navbar fijo y el contenedor
 * donde se renderizan las páginas mediante el componente <Outlet />.
 */
export default function DashboardLayout() {
  // Estado para controlar la visibilidad del Sidebar en dispositivos móviles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Función para alternar el estado del Sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar: 
        Recibe el estado y la función para cerrarse desde el botón 'X' en móvil.
      */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Contenedor de Contenido: 
        'flex-1' para ocupar el resto del ancho, 'min-w-0' para evitar 
        problemas de desbordamiento de flexbox.
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Navbar: 
          Recibe la función para abrir el Sidebar desde el botón de hamburguesa.
        */}
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Área de Visualización Principal:
          'overflow-y-auto' permite que el contenido de las páginas se desplace
          independientemente del Sidebar y Navbar.
        */}
        <main className="flex-1 overflow-y-auto focus:outline-none scrollbar-thin scrollbar-thumb-gray-300">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Outlet:
                Aquí es donde React Router inyectará las páginas como 
                Grupos, Materias, Alumnos, etc.
              */}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
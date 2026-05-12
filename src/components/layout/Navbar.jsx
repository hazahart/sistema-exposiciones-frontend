import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function Navbar({ toggleSidebar }) {
  const { alumno, logout, isAdmin } = useAuth();

  // Nueva función para manejar el cierre de sesión con Toast
  const handleLogout = () => {
    logout();
    toast.info('Sesión cerrada', {
      description: 'Has salido del sistema correctamente.'
    });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-sm font-medium text-gray-500 hidden md:block">
          Instituto Tecnológico de Celaya
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {alumno?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {alumno?.rol || 'Estudiante'}
            </p>
          </div>
          
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 border border-green-200 font-bold">
            {alumno?.nombre ? alumno.nombre.substring(0, 2).toUpperCase() : <User size={20} />}
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
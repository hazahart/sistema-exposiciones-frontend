import {useEffect} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    Users2,
    Presentation,
    ClipboardCheck,
    X
} from 'lucide-react';
import {SlidersHorizontal} from 'lucide-react'

const menuItems = [
    {icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard'},
    {icon: BookOpen, label: 'Materias', path: '/materias'},
    {icon: Users, label: 'Grupos', path: '/grupos'},
    {icon: GraduationCap, label: 'Alumnos', path: '/alumnos'},
    {icon: Users2, label: 'Equipos', path: '/equipos'},
    {icon: Presentation, label: 'Exposiciones', path: '/exposiciones'},
    {icon: ClipboardCheck, label: 'Evaluaciones', path: '/evaluaciones'},
    {icon: SlidersHorizontal, label: 'Criterios', path: '/criterios'},
];

export default function Sidebar({isOpen, toggleSidebar}) {
    const location = useLocation();

    // EFECTO: Cuando la ruta cambie (navegación), cerramos el sidebar en móvil
    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            toggleSidebar();
        }
    }, [location]);

    return (
        <>
            {/* Overlay para móviles */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                            <Presentation className="text-white" size={24}/>
                        </div>
                        <span className="text-xl font-bold text-gray-800">ExpoApp</span>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
                        <X size={24}/>
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({isActive}) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive
                                ? 'bg-green-50 text-green-700 font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
                        >
                            <item.icon size={20}/>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
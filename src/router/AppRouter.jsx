import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/login';
import Grupos from '../pages/grupos/groups';
import Equipos from '../pages/equipos/equipos';
import Dashboard from '../pages/dashboard/Dashboard';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingScreen from '../components/ui/LoadingScreen'; // Asegúrate de crear este archivo

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para evitar que un usuario logueado vaya al Login
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRouter = () => {
    const { loading } = useAuth();

    /**
     * Si el sistema está cargando (verificando token en localStorage, etc.),
     * mostramos la pantalla de carga para evitar que el usuario vea el Login
     * momentáneamente si ya tiene una sesión activa.
     */
    if (loading) {
        return <LoadingScreen />;
  }

    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />

                {/* Rutas Protegidas dentro del Layout */}
                <Route path="/" element={
                    <PrivateRoute>
                        <DashboardLayout />
                    </PrivateRoute>
                }>
                    {/* El path "" o "dashboard" se renderizan en el <Outlet /> del layout */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="grupos" element={<Grupos />} />
                    <Route path="equipos" element={<Equipos />} />
                    {/* Agrega aquí las futuras páginas */}
                    <Route path="materias" element={<div className="p-4">Próximamente: Materias</div>} />
                    <Route path="alumnos" element={<div className="p-4">Próximamente: Alumnos</div>} />
                    <Route path="exposiciones" element={<div className="p-4">Próximamente: Exposiciones</div>} />
                    <Route path="evaluaciones" element={<div className="p-4">Próximamente: Evaluaciones</div>} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
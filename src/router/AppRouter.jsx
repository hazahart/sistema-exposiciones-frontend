import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/login';
import Grupos from '../pages/grupos/groups';
import Equipos from '../pages/equipos/equipos';
import Dashboard from '../pages/dashboard/Dashboard';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingScreen from '../components/ui/LoadingScreen';
import Materias from "../pages/materias/Materias.jsx";
import Alumnos from '../pages/alumnos/alumnos.jsx';
import Exposiciones from "../pages/exposiciones/Exposiciones.jsx";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRouter = () => {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />

                <Route path="/" element={
                    <PrivateRoute><DashboardLayout /></PrivateRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="grupos" element={<Grupos />} />
                    <Route path="equipos" element={<Equipos />} />
                    <Route path="materias" element={<Materias />} />
                    <Route path="alumnos" element={<Alumnos />} />
                    <Route path="exposiciones" element={<Exposiciones />} />
                    <Route path="evaluaciones" element={<div className="p-4">Próximamente: Evaluaciones</div>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
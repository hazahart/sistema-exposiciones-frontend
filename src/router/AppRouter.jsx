import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/auth/login'
import Grupos from '../pages/equipos/groups'

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth()
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />

                <Route path="/grupos" element={
                    <PrivateRoute><Grupos /></PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter
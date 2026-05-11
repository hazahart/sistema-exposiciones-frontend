import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import Login from '../pages/auth/login'
import Grupos from '../pages/grupos/groups'

const DashboardPlaceholder = () => {
    const {alumno, logout} = useAuth()
    return (
        <div style={{padding: '2rem'}}>
            <h1>Bienvenido, {alumno?.nombre}</h1>
            <p>Rol: {alumno?.rol}</p>
            <button onClick={logout}>Cerrar sesión</button>
        </div>
    )
}

const PrivateRoute = ({children}) => {
    const {isAuthenticated} = useAuth()
    return isAuthenticated ? children : <Navigate to="/login" replace/>
}

const PublicRoute = ({children}) => {
    const {isAuthenticated} = useAuth()
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace/>
}

const CatchAll = () => {
    const {isAuthenticated} = useAuth()
    return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace/>
}

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace/>}/>

                <Route path="/login" element={
                    <PublicRoute><Login/></PublicRoute>
                }/>

                <Route path="/dashboard" element={
                    <PrivateRoute><DashboardPlaceholder/></PrivateRoute>
                }/>

                <Route path="/grupos" element={
                    <PrivateRoute><Grupos/></PrivateRoute>
                }/>

                <Route path="*" element={<CatchAll/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter
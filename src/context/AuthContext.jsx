import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi } from '../api/auth.api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [alumno, setAlumno] = useState(null)
    const [loading, setLoading] = useState(true)

    // Cargar sesión inicial
    useEffect(() => {
        const loadStorage = () => {
            try {
                const stored = localStorage.getItem('alumno')
                if (stored) {
                    setAlumno(JSON.parse(stored))
                }
            } catch (error) {
                console.error("Error cargando sesión:", error)
            } finally {
                setTimeout(() => setLoading(false), 1000); 
            }
        }
        loadStorage()
    }, [])

    const login = async (matricula, password) => {
        const { token } = await loginApi(matricula, password)
        const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))))
        
        localStorage.setItem('token', token)
        localStorage.setItem('alumno', JSON.stringify(payload))
        
        // --- CAMBIO CLAVE ---
        // Activamos el loading global para que el AppRouter muestre el spinner
        setLoading(true) 
        setAlumno(payload)

        // Damos un pequeño respiro para que se vea la pantalla de carga del lince
        // antes de entrar formalmente al dashboard
        setTimeout(() => {
            setLoading(false)
        }, 800)
        
        return payload
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('alumno')
        setAlumno(null)
    }

    return (
        <AuthContext.Provider value={{
            alumno,
            login,
            logout,
            loading,
            isAdmin: alumno?.rol === 'admin',
            isAuthenticated: !!alumno
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
    return context
}
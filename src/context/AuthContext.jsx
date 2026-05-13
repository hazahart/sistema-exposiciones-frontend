import {createContext, useContext, useState, useEffect} from 'react'
import {login as loginApi} from '../api/auth.api'

const AuthContext = createContext(null)

export const AuthProvider = ({children}) => {
    const [alumno, setAlumno] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            const stored = localStorage.getItem('alumno')
            if (stored) setAlumno(JSON.parse(stored))
        } catch {
        } finally {
            setLoading(false)
        }
    }, [])

    const login = async (matricula, password) => {
        const {token} = await loginApi(matricula, password)
        const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))))
        localStorage.setItem('token', token)
        localStorage.setItem('alumno', JSON.stringify(payload))
        setAlumno(payload)
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
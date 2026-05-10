import { createContext, useContext, useState } from 'react'
import { login as loginApi } from '../api/auth.api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [alumno, setAlumno] = useState(() => {
        const stored = localStorage.getItem('alumno')
        return stored ? JSON.parse(stored) : null
    })

    const login = async (matricula, password) => {
        const { token } = await loginApi(matricula, password)

        const payload = JSON.parse(atob(token.split('.')[1]))

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

    const isAdmin = alumno?.rol === 'admin'
    const isAuthenticated = !!alumno

    return (
        <AuthContext.Provider value={{ alumno, login, logout, isAdmin, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
    return context
}
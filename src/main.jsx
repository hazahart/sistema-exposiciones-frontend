import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './router/AppRouter'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <AppRouter />
            <Toaster richColors position="top-right" />
        </AuthProvider>
    </StrictMode>
)
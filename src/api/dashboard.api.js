import axios from 'axios';

// Asegúrate de que VITE_API_URL en tu .env termine en /api/v1
const API_URL = import.meta.env.VITE_API_URL || 'https://sistema-exposiciones-backend.onrender.com/api/v1';

export const getDashboardStats = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) throw new Error('No hay token de autenticación');

    const response = await axios.get(`${API_URL}/alumnos/stats/dashboard`, {
        headers: { 
            Authorization: `Bearer ${token}` 
        }
    });
    
    // Verificamos en consola qué llega
    console.log("Datos recibidos del backend:", response.data);
    return response.data;
};
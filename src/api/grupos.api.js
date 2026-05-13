import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor para incluir el token en todas las peticiones (JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** * OBTENCIÓN DE GRUPOS 
 */

// Obtener todos los grupos con paginación
export const getGrupos = async (page = 0, size = 10) => {
  const response = await api.get(`/grupos?page=${page}&size=${size}`);
  return response.data;
};

// Obtener un grupo por ID
export const getGrupoById = async (id) => {
  const response = await api.get(`/grupos/${id}`);
  return response.data;
};

/**
 * GESTIÓN DE GRUPOS (Solo Admin en Backend)
 */

export const createGrupo = async (grupoData) => {
  const response = await api.post('/grupos', grupoData);
  return response.data;
};

export const updateGrupo = async (id, grupoData) => {
  const response = await api.put(`/grupos/${id}`, grupoData);
  return response.data;
};

export const deleteGrupo = async (id) => {
  const response = await api.delete(`/grupos/${id}`);
  return response.data;
};

export default api;
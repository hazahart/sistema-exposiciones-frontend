import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor para incluir el token en todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEquipos = async (page = 0, size = 10) => {
  const response = await api.get(`/equipos?page=${page}&size=${size}`);
  return response.data;
};

export const createEquipo = async (equipoData) => {
  const response = await api.post('/equipos', equipoData);
  return response.data;
};

export const addAlumnoToEquipo = async (idEquipo, idAlumno) => {
  const response = await api.post(`/equipos/${idEquipo}/alumnos`, { id_alumno: idAlumno });
  return response.data;
};

export const deleteEquipo = async (id) => {
  const response = await api.delete(`/equipos/${id}`);
  return response.data;
};
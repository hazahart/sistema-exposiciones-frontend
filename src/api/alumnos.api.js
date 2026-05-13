import apiClient from './apiClient'

export const getAlumnos = async (page = 0, size = 10, nombre = '') => {
    const params = {page, size}
    if (nombre) params.nombre = nombre
    const response = await apiClient.get('/alumnos', {params})
    return response.data
}

export const getAlumnoById = async (id) => {
    const response = await apiClient.get(`/alumnos/${id}`)
    return response.data
}

export const createAlumno = async (data) => {
    const response = await apiClient.post('/alumnos', data)
    return response.data
}

export const updateAlumno = async (id, data) => {
    const response = await apiClient.put(`/alumnos/${id}`, data)
    return response.data
}

export const deleteAlumno = async (id) => {
    await apiClient.delete(`/alumnos/${id}`)
}
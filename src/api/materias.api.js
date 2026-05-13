import apiClient from './apiClient'

export const getMaterias = async (page = 0, size = 10, nombre = '') => {
    const params = {page, size}
    if (nombre) params.nombre = nombre
    const response = await apiClient.get('/materias', {params})
    return response.data
}

export const getMateriaById = async (id) => {
    const response = await apiClient.get(`/materias/${id}`)
    return response.data
}

export const createMateria = async (data) => {
    const response = await apiClient.post('/materias', data)
    return response.data
}

export const updateMateria = async (id, data) => {
    const response = await apiClient.put(`/materias/${id}`, data)
    return response.data
}

export const deleteMateria = async (id) => {
    await apiClient.delete(`/materias/${id}`)
}
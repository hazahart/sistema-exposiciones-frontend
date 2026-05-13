import apiClient from './apiClient'

export const getEquipos = async (page = 0, size = 10) => {
    const response = await apiClient.get('/equipos', {params: {page, size}})
    return response.data
}

export const getEquipoById = async (id) => {
    const response = await apiClient.get(`/equipos/${id}`)
    return response.data
}

export const createEquipo = async (data) => {
    const response = await apiClient.post('/equipos', data)
    return response.data
}

export const updateEquipo = async (id, data) => {
    const response = await apiClient.put(`/equipos/${id}`, data)
    return response.data
}

export const deleteEquipo = async (id) => {
    await apiClient.delete(`/equipos/${id}`)
}

export const addAlumnoToEquipo = async (id, id_alumno) => {
    const response = await apiClient.post(`/equipos/${id}/alumnos`, {id_alumno})
    return response.data
}

export const removeAlumnoFromEquipo = async (id, id_alumno) => {
    await apiClient.delete(`/equipos/${id}/alumnos`, {data: {id_alumno}})
}
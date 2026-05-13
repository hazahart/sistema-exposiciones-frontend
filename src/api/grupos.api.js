import apiClient from './apiClient'

export const getGrupos = async (page = 0, size = 10) => {
    const response = await apiClient.get('/grupos', {params: {page, size}})
    return response.data
}

export const getGrupoById = async (id) => {
    const response = await apiClient.get(`/grupos/${id}`)
    return response.data
}

export const createGrupo = async (data) => {
    const response = await apiClient.post('/grupos', data)
    return response.data
}

export const updateGrupo = async (id, data) => {
    const response = await apiClient.put(`/grupos/${id}`, data)
    return response.data
}

export const deleteGrupo = async (id) => {
    await apiClient.delete(`/grupos/${id}`)
}

export const addAlumnoToGrupo = async (id, id_alumno) => {
    const response = await apiClient.post(`/grupos/${id}/alumnos`, {id_alumno})
    return response.data
}

export const removeAlumnoFromGrupo = async (id, id_alumno) => {
    await apiClient.delete(`/grupos/${id}/alumnos`, {data: {id_alumno}})
}
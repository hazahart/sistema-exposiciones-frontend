import apiClient from './apiClient'

export const getExposiciones = async (page = 0, size = 10, id_equipo = null) => {
    const params = {page, size}
    if (id_equipo) params.id_equipo = id_equipo
    const response = await apiClient.get('/exposiciones', {params})
    return response.data
}

export const getExposicionById = async (id) => {
    const response = await apiClient.get(`/exposiciones/${id}`)
    return response.data
}

export const createExposicion = async (data) => {
    const response = await apiClient.post('/exposiciones', data)
    return response.data
}

export const updateExposicion = async (id, data) => {
    const response = await apiClient.put(`/exposiciones/${id}`, data)
    return response.data
}

export const deleteExposicion = async (id) => {
    await apiClient.delete(`/exposiciones/${id}`)
}
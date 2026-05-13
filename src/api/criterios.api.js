import apiClient from './apiClient'

export const getCriterios = async () => {
    const response = await apiClient.get('/criterios')
    return response.data
}

export const getCriterioById = async (id) => {
    const response = await apiClient.get(`/criterios/${id}`)
    return response.data
}

export const createCriterio = async (data) => {
    const response = await apiClient.post('/criterios', data)
    return response.data
}

export const updateCriterio = async (id, data) => {
    const response = await apiClient.put(`/criterios/${id}`, data)
    return response.data
}

export const deleteCriterio = async (id) => {
    await apiClient.delete(`/criterios/${id}`)
}
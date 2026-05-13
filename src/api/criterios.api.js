import apiClient from './apiClient'

export const getCriterios = async () => {
    const response = await apiClient.get('/criterios')
    return response.data
}
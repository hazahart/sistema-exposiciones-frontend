import apiClient from './apiClient'

export const login = async (matricula, password) => {
    const response = await apiClient.post('/auth/login', { matricula, password })
    return response.data
}
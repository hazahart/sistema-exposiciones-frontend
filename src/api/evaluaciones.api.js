import apiClient from './apiClient'

export const getEvaluaciones = async (page = 0, size = 10, id_exposicion = null, id_alumno_evaluador = null) => {
    const params = {page, size}
    if (id_exposicion) params.id_exposicion = id_exposicion
    if (id_alumno_evaluador) params.id_alumno_evaluador = id_alumno_evaluador
    const response = await apiClient.get('/evaluaciones', {params})
    return response.data
}

export const getEvaluacionById = async (id) => {
    const response = await apiClient.get(`/evaluaciones/${id}`)
    return response.data
}

export const createEvaluacion = async (data) => {
    const response = await apiClient.post('/evaluaciones', data)
    return response.data
}

export const deleteEvaluacion = async (id) => {
    await apiClient.delete(`/evaluaciones/${id}`)
}
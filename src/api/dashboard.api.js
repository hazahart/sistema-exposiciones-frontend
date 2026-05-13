import apiClient from './apiClient'

export const getDashboardStats = async (id_alumno) => {
    const [materiasRes, gruposRes, exposicionesRes, evaluacionesRes] = await Promise.all([
        apiClient.get('/materias', {params: {size: 1}}),
        apiClient.get('/grupos', {params: {size: 1}}),
        apiClient.get('/exposiciones', {params: {size: 100}}),
        apiClient.get('/evaluaciones', {params: {size: 100, id_alumno_evaluador: id_alumno}})
    ])

    const exposiciones = exposicionesRes.data.content || []
    const ahora = new Date()
    const en7dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)

    const proximas = exposiciones.filter(e => {
        const fecha = new Date(e.fecha_programada)
        return fecha >= ahora && fecha <= en7dias && e.estado === 'pendiente'
    })

    return {
        materias_activas: materiasRes.data.totalElements || 0,
        grupos_totales: gruposRes.data.totalElements || 0,
        exposiciones: exposicionesRes.data.totalElements || 0,
        evaluadas: evaluacionesRes.data.totalElements || 0,
        proximas_exposiciones: proximas
    }
}
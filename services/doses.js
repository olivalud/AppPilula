import api from './api'

export const addDose = async (dose) => {
    // dose: { medicamentoId: number, horaPrevista: "HH:mm:ss", status: "prescrito" }
    const res = await api.post('/doses', dose)
    return res.data
}

export const getDoseById = async (id) => {
    const res = await api.get(`/doses/${id}`)
    return res.data
}

export const getDosesByMedicamentoId = async (medicamentoId) => {
    const res = await api.get(`/doses/medicamentos/${medicamentoId}`)
    return res.data
}

export const updateDose = async (id, dose) => {
    const res = await api.put(`/doses/${id}`, dose)
    return res.data
}

export const deleteDose = async (id) => {
    const res = await api.delete(`/doses/${id}`)
    return res.data
}

export default {
    addDose,
    getDoseById,
    getDosesByMedicamentoId,
    updateDose,
    deleteDose,
}

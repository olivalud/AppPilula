import api from "./api"

export async function getUsuarioLogado() {
    const response = await api.get("/usuario/me");
    return response.data
}

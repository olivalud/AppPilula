import api from "./api";

export async function login(cpf: string, senha: string) {
    const response = await api.post("/api/v1/auth/login", {
        cpf: cpf.replace(/\D/g, ""),
        senha,
    });
    return response.data
}

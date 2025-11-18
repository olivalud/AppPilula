import axios from "axios"

const api = axios.create({
    baseURL: "http://192.168.0.25:8080",
})

export default api;

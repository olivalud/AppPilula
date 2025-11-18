import axios from "axios"

const api = axios.create({
    //SEMPRE TROCAR ESSE IP
    baseURL: "http://192.168.0.25:8080/api/v1",
})

export default api;

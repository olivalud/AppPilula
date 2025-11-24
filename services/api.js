import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
    baseURL: "http://192.168.0.25:8080/api/v1",
});

const PUBLIC_ROUTES = [
    "/auth/register",
    "/auth/login",
];

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");

        const isPublic = PUBLIC_ROUTES.some(route =>
            config.url && config.url.includes(route)
        );

        if (!isPublic && token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

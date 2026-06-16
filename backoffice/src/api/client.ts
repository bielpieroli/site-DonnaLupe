import axios from "axios";
import type { AxiosInstance } from "axios";
import { BASEURL } from "@/constants/ApiURL";

const TOKEN_KEY = "donna-lupe-backoffice-token";
const SESSION_KEY = "semcomp-backoffice-auth";

const client: AxiosInstance = axios.create({
  baseURL: BASEURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Injeta token Bearer em toda requisição autenticada
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Remove sessão inteira e redireciona para login em caso de 401 (token expirado/inválido)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export { TOKEN_KEY, SESSION_KEY };
export default client;

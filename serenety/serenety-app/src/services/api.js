import axios from "axios";
import store from "@/store";
import router from "@/router";

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercettore di richiesta per aggiungere token JWT
api.interceptors.request.use(
  (config) => {
    const token = store.state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercettore di risposta per gestire errori di autenticazione
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch("auth/logout");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default api;

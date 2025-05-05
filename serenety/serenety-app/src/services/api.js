// src/services/api.js
import axios from "axios";
import store from "@/store"; // Assicurati che l'import dello store sia corretto
import router from "@/router"; // Necessario per il redirect nell'interceptor di risposta

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercettore di richiesta per aggiungere token JWT
api.interceptors.request.use(
  (config) => {
    // Log per debug (puoi rimuoverlo una volta risolto)
    console.log(
      "Interceptor Request - Check store.state.auth:",
      store.state.auth
    );

    // --- MODIFICA QUI ---
    // Usa optional chaining (?.) per accedere al token in modo sicuro.
    // Se store.state.auth è null o undefined, token sarà undefined senza errori.
    const token = store.state.auth?.token;
    // --------------------

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Interceptor Request - Authorization header SET");
    } else {
      console.log(
        "Interceptor Request - Authorization header NOT SET (No token)"
      );
    }
    return config;
  },
  (error) => {
    console.error("Interceptor Request Error:", error);
    return Promise.reject(error);
  }
);

// Intercettore di risposta per gestire errori di autenticazione (sembra ok, ma aggiungiamo log)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Interceptor Response Error Status:", error.response?.status);
    // Usa optional chaining anche qui per sicurezza
    if (error.response?.status === 401) {
      console.warn(
        "Interceptor Response: 401 Unauthorized detected. Logging out user."
      );
      // Assicurati che il nome del modulo e dell'azione siano corretti
      store.dispatch("auth/logout").catch((logoutErr) => {
        console.error("Error during automatic logout dispatch:", logoutErr);
      });
      // Assicurati che la rotta di login sia corretta
      router.push({ name: "HomePage" }).catch((routeErr) => {
        // O '/login' se hai una rotta specifica
        console.error("Error during automatic redirect to login:", routeErr);
      });
    }
    return Promise.reject(error);
  }
);

export default api;

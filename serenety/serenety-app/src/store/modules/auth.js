// src/store/modules/auth.js

// Simuliamo chiamate API semplici qui per focalizzarci sulla logica dello store
// Nella tua app reale, useresti il tuo `authService` o chiamate `api` axios
const mockApiService = {
  async post(endpoint, credentials) {
    console.log(`[DEBUG Mock API] POST to ${endpoint} with data:`, {
      ...credentials,
      password: "[HIDDEN]",
    });
    const urlBase = process.env.VUE_APP_API_URL || "";
    try {
      const response = await fetch(`${urlBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(
          `[DEBUG Mock API] Error response from ${endpoint}:`,
          data
        );
        throw new Error(data.message || `Request failed (${response.status})`);
      }
      console.log(`[DEBUG Mock API] Success response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(
        `[DEBUG Mock API] Network or parsing error for ${endpoint}:`,
        error
      );
      throw error;
    }
  },
};

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    // Aggiungiamo uno stato per l'errore di autenticazione
    authError: null,
  },
  mutations: {
    SET_TOKEN(state, token) {
      console.log(
        "[DEBUG] Mutation SET_TOKEN:",
        token ? "Token received" : "Token cleared"
      );
      state.token = token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },
    SET_USER(state, user) {
      console.log("[DEBUG] Mutation SET_USER - User object received:", user);
      state.user = user;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    },
    LOGOUT(state) {
      console.log("[DEBUG] Mutation LOGOUT");
      state.token = null;
      state.user = null;
      state.authError = null; // Pulisci errore al logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    SET_AUTH_ERROR(state, error) {
      console.log("[DEBUG] Mutation SET_AUTH_ERROR:", error);
      state.authError = error;
    },
    CLEAR_AUTH_ERROR(state) {
      state.authError = null;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      commit("CLEAR_AUTH_ERROR"); // Pulisci errori precedenti
      try {
        console.log("[DEBUG] Action login - Credentials received:", {
          ...credentials,
          password: "[HIDDEN]",
        });

        // Determina se è un tentativo di login admin
        // Usiamo l'email per semplicità, ma potresti passare un flag dal componente
        const isAdminLoginAttempt = credentials.email === "admin@example.com";
        const apiEndpoint = isAdminLoginAttempt
          ? "/api/admin/login"
          : "/api/login";

        console.log(`[DEBUG] Action login - Calling endpoint: ${apiEndpoint}`);
        const response = await mockApiService.post(apiEndpoint, credentials); // Usa il servizio appropriato

        console.log("[DEBUG] Action login - Response from API:", response);

        // --- LOGICA CRUCIALE: Estrarre utente e token in base alla risposta ---
        let userToCommit = null;
        let tokenToCommit = null;

        if (isAdminLoginAttempt && response.admin) {
          // Risposta dal LOGIN ADMIN (/api/admin/login)
          console.log("[DEBUG] Action login - Handling ADMIN login response.");
          userToCommit = response.admin; // L'utente è dentro response.admin
          tokenToCommit = response.adminToken; // Il token è response.adminToken
        } else if (!isAdminLoginAttempt && response._id) {
          // Risposta dal LOGIN NORMALE (/api/login)
          console.log(
            "[DEBUG] Action login - Handling REGULAR user login response."
          );
          userToCommit = response; // L'utente è direttamente nella risposta
          // Assumiamo che il login normale NON restituisca un token in questo setup
          tokenToCommit = null;
          // Se il login normale dovesse restituire un token, sarebbe tipo:
          // tokenToCommit = response.token;
        } else {
          // La risposta non corrisponde a nessuno dei formati attesi
          console.error(
            "[ERROR] Action login - Unexpected API response structure:",
            response
          );
          throw new Error("Login failed: Unexpected server response.");
        }
        // --------------------------------------------------------------------

        console.log("[DEBUG] Action login - Committing user:", userToCommit);
        console.log(
          "[DEBUG] Action login - Committing token:",
          tokenToCommit ? "Token present" : "No token"
        );

        // Esegui le mutazioni solo se abbiamo trovato dati validi
        if (userToCommit) {
          commit("SET_USER", userToCommit);
          if (tokenToCommit) {
            // Commit token solo se esiste E abbiamo l'utente
            commit("SET_TOKEN", tokenToCommit);
          } else {
            commit("SET_TOKEN", null); // Assicurati che il token sia nullo se non fornito
          }
        } else {
          console.warn(
            "[DEBUG] Action login - No valid user object found in API response to commit."
          );
          commit("SET_USER", null); // Pulisci utente se la risposta è invalida
          commit("SET_TOKEN", null); // Pulisci token se la risposta è invalida
          throw new Error("Login failed: Could not process server response.");
        }

        return response; // Restituisci la risposta originale per usi futuri nel componente
      } catch (error) {
        console.error("[ERROR] Action login failed:", error);
        commit(
          "SET_AUTH_ERROR",
          error.message || "An unknown login error occurred."
        );
        // Pulisci stato parziale in caso di errore
        commit("SET_USER", null);
        commit("SET_TOKEN", null);
        throw error; // Rilancia l'errore per gestirlo nel componente
      }
    },

    // Mantieni l'azione register se la usi
    // async register({ commit }, userData) { ... },

    logout({ commit }) {
      console.log("[DEBUG] Action logout invoked");
      // Qui potresti chiamare un endpoint API /api/logout se esiste
      commit("LOGOUT");
    },

    // Azione per pulire manualmente l'errore
    clearAuthError({ commit }) {
      commit("CLEAR_AUTH_ERROR");
    },
  },
  getters: {
    // Controlla se c'è un utente loggato (più affidabile del solo token in questo caso)
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => {
      const user = state.user;
      const result = user && user.isAdmin === true;
      // Log più conciso
      console.log(
        `[DEBUG] Getter isAdmin check: User present=${!!user}, User isAdmin=${
          user?.isAdmin
        }, Result=${result}`
      );
      return result;
    },
    currentUser: (state) => state.user,
    authError: (state) => state.authError, // Getter per l'errore
  },
};

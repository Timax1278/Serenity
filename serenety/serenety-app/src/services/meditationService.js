// src/services/meditationService.js
import api from "./api"; // Usa l'istanza axios configurata

export default {
  // --- Chiamate per ottenere dati ---

  /**
   * Recupera le tracce di meditazione dal backend (che ora chiama Freesound).
   * @param {object} params - Parametri di query opzionali (es. { genre: 'nature' } - corrisponde a un tag)
   * @returns {Promise<Array>} Una Promise che risolve con un array di oggetti traccia mappati.
   */
  async getMeditations(params = {}) {
    console.log(
      "[Service getMeditations] Fetching meditations with params:",
      params
    );
    try {
      const response = await api.get("/api/meditations", { params });
      console.log(
        `[Service getMeditations] Received ${response.data?.length} tracks.`
      );
      return response.data || []; // Restituisci array vuoto se data è null/undefined
    } catch (error) {
      console.error(
        "[ERROR Service getMeditations] Failed to fetch meditations:",
        error
      );
      throw error; // Rilancia per gestione nell'azione Vuex
    }
  },

  /**
   * Recupera la lista dei generi unici disponibili (Attualmente non usata attivamente).
   * @returns {Promise<Array<string>>} Una Promise che risolve con un array di stringhe genere.
   */
  async getGenres() {
    console.log(
      "[Service getGenres] Fetching unique genres (currently unused/needs rethink)."
    );
    try {
      // Questa API potrebbe essere disabilitata o da modificare nel backend
      const response = await api.get("/api/meditations/genres");
      console.log("[Service getGenres] Received genres:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("[ERROR Service getGenres] Failed to fetch genres:", error);
      throw error;
    }
  },

  // --- Chiamata per registrare l'ascolto (Invariata) ---
  async recordListen(trackId, genre, completed, userId) {
    if (!trackId || !userId) {
      const errorMsg = `[ERROR Service recordListen] Missing required fields: trackId=${trackId}, userId=${userId}`;
      console.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    const genreToSend = genre || "Unknown";
    console.log(
      `[Service recordListen] Recording listen: Track=${trackId}, Genre=${genreToSend}, Completed=${completed}, User=${userId}`
    );
    try {
      const response = await api.post("/api/meditations/history", {
        trackId,
        genre: genreToSend,
        completed,
        userId,
      });
      console.log("[Service recordListen] API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "[ERROR Service recordListen] Failed API call:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

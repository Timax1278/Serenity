// src/store/modules/meditation.js
import meditationService from "@/services/meditationService";

export default {
  namespaced: true,
  state: {
    allTracks: [],
    genres: [], // Conterrà i tag derivati
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    error: null,
  },
  mutations: {
    SET_TRACKS(state, tracks) {
      console.log("[VUEX MUTATION SET_TRACKS] Setting tracks:", tracks?.length); // Log solo lunghezza
      state.allTracks = tracks;
    },
    SET_GENRES(state, genres) {
      console.log(
        "[VUEX MUTATION SET_GENRES] Setting derived genres/tags:",
        genres
      );
      state.genres = genres;
    },
    SET_CURRENT_TRACK(state, track) {
      console.log(
        "[VUEX MUTATION SET_CURRENT_TRACK] Setting current track:",
        track?.title
      );
      state.currentTrack = track;
      if (track) {
        if (state.isPlaying) state.isPlaying = false;
      } else {
        state.isPlaying = false;
      }
    },
    SET_IS_PLAYING(state, playing) {
      if (!state.currentTrack && playing) {
        if (state.isPlaying) state.isPlaying = false;
        return;
      }
      if (state.isPlaying !== playing) {
        console.log(
          `[VUEX MUTATION SET_IS_PLAYING] Setting isPlaying to: ${playing}`
        );
        state.isPlaying = playing;
      }
    },
    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    clearMeditationError({ commit }) {
      commit("CLEAR_ERROR");
    },

    async fetchMeditations({ commit, dispatch }, params = {}) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");
      try {
        console.log(
          "[VUEX ACTION fetchMeditations] Fetching meditations with params:",
          params
        );
        const tracks = await meditationService.getMeditations(params);
        console.log(
          `[VUEX ACTION fetchMeditations] Received ${
            tracks?.length || 0
          } tracks.`
        );
        // Commit solo se tracks è un array (anche vuoto)
        commit("SET_TRACKS", Array.isArray(tracks) ? tracks : []);
        // Deriva generi anche se tracks è vuoto (risulterà in generi vuoti)
        dispatch("deriveGenresFromTracks", Array.isArray(tracks) ? tracks : []);
      } catch (error) {
        console.error("[ERROR] Error fetching meditations:", error);
        commit(
          "SET_ERROR",
          error.message || "Failed to fetch meditation tracks"
        );
        commit("SET_TRACKS", []); // Imposta array vuoto in caso di errore fetch
        commit("SET_GENRES", []); // Imposta generi vuoti in caso di errore fetch
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // --- MODIFICATA PER LOG E FILTRO MENO AGGRESSIVO ---
    deriveGenresFromTracks({ commit }, tracks) {
      console.log(
        "[VUEX ACTION deriveGenresFromTracks] Deriving genres. Tracks received:",
        tracks?.length
      );
      // Logga i primi 5 oggetti traccia per vedere la struttura dei tag
      if (tracks && tracks.length > 0) {
        console.log(
          "[VUEX ACTION deriveGenresFromTracks] Sample raw tracks data for tags:",
          JSON.parse(
            JSON.stringify(
              tracks.slice(0, 5).map((t) => ({ id: t._id, tags: t.tags }))
            )
          )
        );
      }

      if (!Array.isArray(tracks) || tracks.length === 0) {
        commit("SET_GENRES", []);
        return;
      }

      const allTags = tracks.map((track) => track.tags || []).flat();
      console.log(
        "[VUEX ACTION deriveGenresFromTracks] All tags extracted:",
        allTags
      );

      // Riduciamo la lista di esclusione per vedere se emerge qualcosa
      const commonOrIrrelevantTags = [
        "loop",
        "field-recording",
        "sound",
        "mono",
        "stereo",
        "sample", // Lista molto più corta
      ];
      const filteredTags = allTags.filter(
        (tag) =>
          tag &&
          typeof tag === "string" &&
          tag.length > 1 && // Aggiunto controllo lunghezza > 1
          !commonOrIrrelevantTags.includes(tag.toLowerCase()) &&
          !/\d/.test(tag) // Escludi tag che contengono numeri (spesso irrilevanti)
      );
      console.log(
        "[VUEX ACTION deriveGenresFromTracks] Tags after basic filtering:",
        filteredTags
      );

      const uniqueGenres = [...new Set(filteredTags)]
        .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
        .sort((a, b) => a.localeCompare(b));

      console.log(
        "[VUEX ACTION deriveGenresFromTracks] Derived unique genres/tags:",
        uniqueGenres
      );
      commit("SET_GENRES", uniqueGenres);
    },
    // ----------------------------------------------------

    selectTrack({ commit }, track) {
      console.log(
        `[VUEX ACTION selectTrack] Selecting track: ${track.title} (ID: ${track._id})`
      );
      commit("SET_CURRENT_TRACK", track);
    },

    play({ commit, state }) {
      if (state.currentTrack && !state.isPlaying) {
        console.log("[VUEX ACTION play] Committing SET_IS_PLAYING true");
        commit("SET_IS_PLAYING", true);
      } else if (!state.currentTrack) {
        console.warn("[VUEX ACTION play] Cannot play, no track selected.");
      }
    },

    pause({ commit, state: moduleState }) {
      if (moduleState.isPlaying) {
        console.log("[VUEX ACTION pause] Committing SET_IS_PLAYING false");
        commit("SET_IS_PLAYING", false);
      } else {
        console.log("[VUEX ACTION pause] Already paused, action ignored.");
      }
    },

    async recordListenHistory(
      { rootState },
      { trackId, genre, completed = false }
    ) {
      const userId = rootState.auth.user?._id;
      if (!userId) {
        console.warn(
          "[VUEX ACTION recordListenHistory] Cannot record, user not logged in."
        );
        return;
      }
      if (!trackId)
        console.warn("[VUEX ACTION recordListenHistory] trackId is missing.");

      try {
        console.log(
          `[VUEX ACTION recordListenHistory] Dispatching record for User: ${userId}, Track: ${
            trackId || "N/A"
          }, Genre: ${genre || "Unknown"}, Completed: ${completed}`
        );
        await meditationService.recordListen(trackId, genre, completed, userId);
        console.log(
          `[VUEX ACTION recordListenHistory] Listen recorded successfully via API for Track: ${trackId}`
        );
      } catch (error) {
        console.error(
          "[ERROR] Failed to record listen history via action:",
          error
        );
      }
    },
  },
  getters: {
    getAllTracks: (state) => state.allTracks || [], // Assicura sempre array
    getGenres: (state) => state.genres || [], // Assicura sempre array
    getCurrentTrack: (state) => state.currentTrack,
    isPlaying: (state) => state.isPlaying,
    isLoading: (state) => state.isLoading,
    getError: (state) => state.error,
  },
};

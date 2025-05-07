// src/store/modules/appointments.js
import appointmentService from "@/services/appointmentService"; // Assicurati che il percorso sia corretto

export default {
  namespaced: true, // Abilita namespace per il modulo
  state: {
    services: [], // Lista dei servizi disponibili per gli utenti
    professionals: [], // Lista completa dei professionisti (se caricata separatamente)
    availabilitySlots: [], // Slot disponibili per data/prof selezionati (array di stringhe HH:MM)
    userAppointments: [], // Appuntamenti specifici dell'utente loggato
    isLoading: false, // Flag di caricamento generale (es. per servizi, appuntamenti utente)
    isAvailabilityLoading: false, // Flag specifico per caricamento disponibilità
    isBookingLoading: false, // Flag specifico per l'azione di prenotazione/cancellazione
    error: null, // Errore generico del modulo
    availabilityError: null, // Errore specifico del caricamento disponibilità
    bookingError: null, // Errore specifico della prenotazione/cancellazione
  },
  mutations: {
    SET_SERVICES(state, services) {
      console.log(
        `[VUEX MUTATION SET_SERVICES] Setting ${
          services?.length || 0
        } services.`
      );
      state.services = services || [];
    },
    SET_PROFESSIONALS(state, professionals) {
      console.log(
        `[VUEX MUTATION SET_PROFESSIONALS] Setting ${
          professionals?.length || 0
        } professionals.`
      );
      state.professionals = professionals || [];
    },
    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },
    SET_AVAILABILITY_LOADING(state, loading) {
      state.isAvailabilityLoading = loading;
    },
    SET_BOOKING_LOADING(state, loading) {
      state.isBookingLoading = loading;
    }, // Usato sia per booking che cancel
    SET_AVAILABILITY_SLOTS(state, slots) {
      console.log(
        `[VUEX MUTATION SET_AVAILABILITY_SLOTS] Setting ${
          slots?.length || 0
        } slots.`
      );
      state.availabilitySlots = slots || [];
    },
    SET_USER_APPOINTMENTS(state, appointments) {
      console.log(
        `[VUEX MUTATION SET_USER_APPOINTMENTS] Setting ${
          appointments?.length || 0
        } user appointments.`
      );
      // Ordina gli appuntamenti prima di salvarli nello stato
      const sortedAppointments = (appointments || []).sort((a, b) => {
        // Combina data e ora per un confronto corretto
        // Aggiunge ':00Z' per interpretare come UTC e evitare problemi di timezone non consistenti
        const dateA = new Date(`${a.date}T${a.time || "00:00"}:00Z`);
        const dateB = new Date(`${b.date}T${b.time || "00:00"}:00Z`);
        return dateA - dateB; // Ordine cronologico
      });
      state.userAppointments = sortedAppointments;
    },
    // Aggiunge UN appuntamento alla lista esistente e mantiene l'ordine
    ADD_APPOINTMENT(state, newAppointment) {
      if (
        newAppointment?._id &&
        !state.userAppointments.some((app) => app._id === newAppointment._id)
      ) {
        console.log(
          `[VUEX MUTATION ADD_APPOINTMENT] Adding appointment:`,
          newAppointment._id
        );
        // Aggiungi e riordina
        const updatedList = [...state.userAppointments, newAppointment].sort(
          (a, b) => {
            const dateA = new Date(`${a.date}T${a.time || "00:00"}:00Z`);
            const dateB = new Date(`${b.date}T${b.time || "00:00"}:00Z`);
            return dateA - dateB;
          }
        );
        state.userAppointments = updatedList;
      } else {
        console.warn(
          `[VUEX MUTATION ADD_APPOINTMENT] Attempted to add invalid or duplicate appointment.`
        );
      }
    },
    // Rimuove un appuntamento dalla lista per ID
    REMOVE_APPOINTMENT(state, appointmentId) {
      console.log(
        `[VUEX MUTATION REMOVE_APPOINTMENT] Removing appointment ID: ${appointmentId}`
      );
      state.userAppointments = state.userAppointments.filter(
        (app) => app._id !== appointmentId
      );
    },
    // Imposta errori
    SET_ERROR(state, error) {
      console.error("[VUEX MUTATION SET_ERROR] Setting general error:", error);
      state.error = error;
    },
    SET_AVAILABILITY_ERROR(state, error) {
      console.error(
        "[VUEX MUTATION SET_AVAILABILITY_ERROR] Setting availability error:",
        error
      );
      state.availabilityError = error;
    },
    SET_BOOKING_ERROR(state, error) {
      console.error(
        "[VUEX MUTATION SET_BOOKING_ERROR] Setting booking/cancel error:",
        error
      );
      state.bookingError = error;
    },
    // Pulisce tutti gli errori specifici di questo modulo
    CLEAR_ERROR(state) {
      console.log(
        "[VUEX MUTATION CLEAR_ERROR] Clearing appointment module errors."
      );
      state.error = null;
      state.availabilityError = null;
      state.bookingError = null;
    },
  },
  actions: {
    // Azione per pulire tutti gli errori del modulo
    clearAppointmentErrors({ commit }) {
      commit("CLEAR_ERROR");
    },

    // --- Azioni per Utenti ---

    // Carica servizi disponibili (popolati)
    async fetchServices({ commit }) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");
      try {
        console.log(
          "[VUEX ACTION fetchServices] Fetching available services..."
        );
        const services = await appointmentService.getServices();
        commit("SET_SERVICES", services);
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch services"
        );
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Carica slot disponibilità
    async fetchAvailability({ commit }, { professionalId, date }) {
      commit("SET_AVAILABILITY_LOADING", true);
      commit("SET_AVAILABILITY_SLOTS", []);
      commit("CLEAR_ERROR"); // Pulisce errori precedenti (generico, availability, booking)
      try {
        console.log(
          `[VUEX ACTION fetchAvailability] Fetching for Prof: ${professionalId}, Date: ${date}`
        );
        const slots = await appointmentService.getAvailability(
          professionalId,
          date
        );
        commit("SET_AVAILABILITY_SLOTS", slots);
      } catch (error) {
        commit(
          "SET_AVAILABILITY_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to load available slots."
        );
      } finally {
        commit("SET_AVAILABILITY_LOADING", false);
      }
    },
    // src/store/modules/appointments.js -> actions

    // Prenota un appuntamento
    async bookAppointment({ commit, dispatch, rootState }, bookingData) {
      commit("SET_BOOKING_LOADING", true);
      commit("CLEAR_ERROR");
      const userId = rootState.auth.user?._id;
      if (!userId) {
        commit("SET_BOOKING_ERROR", "User not authenticated.");
        commit("SET_BOOKING_LOADING", false);
        throw new Error("User not authenticated.");
      }
      if (
        !bookingData.professionalId ||
        !bookingData.serviceId ||
        !bookingData.date ||
        !bookingData.time
      ) {
        commit("SET_BOOKING_ERROR", "Incomplete booking information provided.");
        commit("SET_BOOKING_LOADING", false);
        throw new Error("Incomplete booking information.");
      }
      const completeBookingData = { ...bookingData, userId };

      try {
        console.log(
          "[VUEX ACTION bookAppointment] Attempting to book:",
          completeBookingData
        );
        const newAppointment = await appointmentService.bookAppointment(
          completeBookingData
        );
        if (!newAppointment || !newAppointment._id) {
          throw new Error(
            "Booking confirmation failed. API did not return valid appointment."
          );
        }
        console.log(
          "[VUEX ACTION bookAppointment] Booking successful! API response:",
          newAppointment
        );

        // Aggiungi subito l'appuntamento alla lista locale per reattività UI istantanea
        commit("ADD_APPOINTMENT", newAppointment);

        // Ricarica la disponibilità per aggiornare gli slot rimanenti
        console.log(
          `[VUEX ACTION bookAppointment] Refreshing availability for ${bookingData.date}...`
        );
        // Non aspettare questa chiamata per dare feedback all'utente, ma falla in background
        dispatch("fetchAvailability", {
          professionalId: bookingData.professionalId,
          date: bookingData.date,
        }).catch((err) =>
          console.warn("Failed to refresh availability after booking:", err)
        ); // Logga ma non bloccare

        return newAppointment; // Restituisci l'appuntamento al componente
      } catch (error) {
        console.error(
          "[ERROR] Error during bookAppointment action:",
          error.response?.data || error.message || error
        );
        commit(
          "SET_BOOKING_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to book appointment. Slot might be unavailable."
        );
        throw error; // Rilancia per componente
      } finally {
        commit("SET_BOOKING_LOADING", false);
      }
    },

    // Carica gli appuntamenti dell'utente loggato
    async fetchUserAppointments({ commit, rootState }) {
      commit("SET_LOADING", true); // Usa loading generale
      commit("CLEAR_ERROR");
      const userId = rootState.auth.user?._id;
      if (!userId) {
        console.warn("[VUEX fetchUserAppointments] No user logged in.");
        commit("SET_USER_APPOINTMENTS", []); // Imposta lista vuota
        commit("SET_LOADING", false);
        return;
      }
      try {
        console.log(
          `[VUEX ACTION fetchUserAppointments] Fetching appointments for User: ${userId}`
        );
        // !!! Assicurati che esista appointmentService.getUserAppointments(...) !!!
        const appointments = await appointmentService.getUserAppointments(
          userId
        );
        commit("SET_USER_APPOINTMENTS", appointments);
      } catch (error) {
        console.error(
          "[ERROR] Error fetching user appointments:",
          error.response?.data || error.message
        );
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to load your appointments."
        );
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Cancella un appuntamento
    async cancelUserAppointment({ commit, dispatch }, appointmentId) {
      commit("SET_LOADING", true); // Potrebbe servire un loading specifico
      commit("CLEAR_ERROR");
      try {
        console.log(
          `[VUEX ACTION cancelUserAppointment] Cancelling appointment ID: ${appointmentId}`
        );
        // !!! Assicurati che esista appointmentService.cancelAppointment(...) !!!
        await appointmentService.cancelAppointment(appointmentId);
        console.log(
          `[VUEX ACTION cancelUserAppointment] Cancellation successful for ID: ${appointmentId}.`
        );
        // Rimuovi dallo stato locale o ricarica
        // commit('REMOVE_APPOINTMENT', appointmentId);
        await dispatch("fetchUserAppointments"); // Ricarica la lista aggiornata
      } catch (error) {
        console.error(
          "[ERROR] Error cancelling appointment:",
          error.response?.data || error.message
        );
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to cancel appointment."
        );
        throw error; // Rilancia per UI
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // --- Azioni per Amministratori ---
    async adminCreateService(
      { commit, dispatch },
      { serviceData, adminCredentials }
    ) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");
      try {
        console.log(
          "[VUEX ACTION adminCreateService] Attempting to create service:",
          serviceData
        );
        const newService = await appointmentService.adminCreateService(
          serviceData,
          adminCredentials
        );
        console.log(
          "[VUEX ACTION adminCreateService] Service created via API:",
          newService._id,
          "Refreshing service list..."
        );
        await dispatch("fetchServices");
      } catch (error) {
        console.error(
          "[ERROR] Error creating service via admin action:",
          error.response?.data || error.message
        );
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to create service"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    // TODO: Implementare altre azioni admin (fetch/create/update/delete Professionals)
    // async adminFetchProfessionals({ commit }, adminCredentials) { ... commit('SET_PROFESSIONALS', ...); ... }
  },
  getters: {
    getAvailableServices: (state) => state.services,
    getProfessionals: (state) => state.professionals,
    isLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getAvailabilitySlots: (state) => state.availabilitySlots,
    isAvailabilityLoading: (state) => state.isAvailabilityLoading,
    getAvailabilityError: (state) => state.availabilityError,
    isBookingLoading: (state) => state.isBookingLoading,
    getBookingError: (state) => state.bookingError,
    // Assicura che venga sempre restituito un array, anche all'inizio
    getUserAppointments: (state) => state.userAppointments || [],
  },
};

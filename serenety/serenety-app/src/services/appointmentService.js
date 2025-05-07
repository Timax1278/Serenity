// src/services/appointmentService.js
import api from "./api"; // Usa l'istanza axios configurata

export default {
  // --- Chiamate Utente ---

  /**
   * Recupera la lista dei servizi disponibili, popolati con info professionisti.
   * @returns {Promise<Array>} Una Promise che risolve con un array di oggetti servizio.
   */
  async getServices() {
    console.log("[Service getServices] Fetching populated services...");
    try {
      const response = await api.get("/api/services");
      console.log(
        `[Service getServices] Received ${response.data?.length || 0} services.`
      );
      return response.data || [];
    } catch (error) {
      console.error(
        "[ERROR Service getServices] Failed:",
        error.response?.data || error.message
      );
      throw error; // Rilancia per gestione nell'azione Vuex
    }
  },

  /**
   * Recupera gli slot orari disponibili per un dato professionista e data.
   * @param {string} professionalId L'ID del professionista.
   * @param {string} date La data richiesta in formato "YYYY-MM-DD".
   * @returns {Promise<Array<string>>} Una Promise che risolve con un array di orari disponibili (es. ["09:00", "10:00"]).
   */
  async getAvailability(professionalId, date) {
    if (!professionalId || !date) {
      const errorMsg =
        "[ERROR Service getAvailability] Missing professionalId or date.";
      console.error(errorMsg);
      return Promise.reject(
        new Error("Professional ID and date are required.")
      );
    }
    console.log(
      `[Service getAvailability] Fetching for Prof: ${professionalId}, Date: ${date}`
    );
    try {
      // Assicurati che l'endpoint nel backend sia corretto
      const response = await api.get(`/api/availability/${professionalId}`, {
        params: { date },
      });
      console.log(
        `[Service getAvailability] Received slots for ${date}:`,
        response.data
      );
      return response.data || []; // Restituisce array (vuoto se nessun slot)
    } catch (error) {
      console.error(
        `[ERROR Service getAvailability] Failed for Prof ${professionalId}, Date ${date}:`,
        error.response?.data || error.message
      );
      throw error; // Rilancia per gestione nell'azione Vuex
    }
  },

  /**
   * Invia i dati di prenotazione al backend per creare un nuovo appuntamento.
   * @param {object} bookingData Oggetto contenente { userId, professionalId, serviceId, date, time }.
   * @returns {Promise<object>} Una Promise che risolve con l'oggetto appuntamento creato dal backend.
   */
  async bookAppointment(bookingData) {
    console.log(
      "[Service bookAppointment] Sending booking request to API:",
      bookingData
    );
    // Aggiungi un controllo per assicurarti che i dati necessari ci siano
    if (
      !bookingData.userId ||
      !bookingData.professionalId ||
      !bookingData.serviceId ||
      !bookingData.date ||
      !bookingData.time
    ) {
      const errorMsg =
        "[ERROR Service bookAppointment] Incomplete booking data provided.";
      console.error(errorMsg, bookingData);
      return Promise.reject(new Error(errorMsg));
    }
    try {
      // Chiama l'API backend POST /api/appointments
      const response = await api.post("/api/appointments", bookingData);
      console.log(
        "[Service bookAppointment] API booking response:",
        response.data
      );
      // Restituisci i dati dell'appuntamento creato (il backend dovrebbe restituire l'oggetto completo)
      return response.data;
    } catch (error) {
      console.error(
        "[ERROR Service bookAppointment] Failed API call:",
        error.response?.data || error.message
      );
      // Rilancia l'errore per gestirlo nell'azione Vuex
      throw error;
    }
  },

  /**
   * Recupera gli appuntamenti per l'utente specificato.
   * NOTA: Idealmente l'userId dovrebbe essere preso dal token nel backend, non passato come query param.
   * @param {string} userId L'ID dell'utente.
   * @returns {Promise<Array>} Una Promise che risolve con un array di oggetti appuntamento.
   */
  async getUserAppointments(userId) {
    if (!userId) {
      console.error("[ERROR Service getUserAppointments] User ID is required.");
      return Promise.reject(new Error("User ID is required."));
    }
    console.log(
      `[Service getUserAppointments] Fetching appointments for User ID: ${userId}`
    );
    try {
      // Chiama GET /api/appointments passando userId come query param
      // Ricorda: Questo è insicuro se non validato anche lato backend tramite token
      const response = await api.get("/api/appointments", {
        params: { userId },
      });
      console.log(
        `[Service getUserAppointments] Received ${
          response.data?.length || 0
        } appointments.`
      );
      return response.data || [];
    } catch (error) {
      console.error(
        "[ERROR Service getUserAppointments] Failed API call:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Invia una richiesta per cancellare un appuntamento.
   * NOTA: Il backend dovrebbe verificare che l'utente loggato (dal token) sia il proprietario dell'appuntamento.
   * @param {string} appointmentId L'ID dell'appuntamento da cancellare.
   * @returns {Promise<object>} Una Promise che risolve con la risposta dell'API (es. messaggio di successo).
   */
  async cancelAppointment(appointmentId) {
    if (!appointmentId) {
      console.error(
        "[ERROR Service cancelAppointment] Appointment ID is required."
      );
      return Promise.reject(new Error("Appointment ID is required."));
    }
    console.log(
      `[Service cancelAppointment] Requesting cancellation for ID: ${appointmentId}`
    );
    try {
      // Chiama DELETE /api/appointments/:appointmentId
      // L'header Authorization (se usi JWT) verrà aggiunto dall'interceptor di Axios
      const response = await api.delete(`/api/appointments/${appointmentId}`);
      console.log("[Service cancelAppointment] API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "[ERROR Service cancelAppointment] Failed API call:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // --- Chiamate Admin ---

  /**
   * Recupera tutti i servizi (per gestione admin).
   * @param {object} adminCredentials Oggetto con { adminEmail, adminPassword }.
   */
  async adminGetServices(adminCredentials) {
    console.log(
      "[Service adminGetServices] Fetching all services for admin..."
    );
    try {
      // Nota: GET con credenziali nei params è insolito, ma segue il middleware attuale
      const response = await api.get("/api/admin/services", {
        params: adminCredentials,
      });
      return response.data || [];
    } catch (error) {
      console.error(
        "[ERROR Service adminGetServices] Failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Crea un nuovo servizio.
   * @param {object} serviceData Dati del servizio da creare.
   * @param {object} adminCredentials Oggetto con { adminEmail, adminPassword }.
   */
  async adminCreateService(serviceData, adminCredentials) {
    console.log("[Service adminCreateService] Creating service:", serviceData);
    const payload = { ...serviceData, ...adminCredentials }; // Combina dati e credenziali per il body
    try {
      const response = await api.post("/api/admin/services", payload);
      return response.data;
    } catch (error) {
      console.error(
        "[ERROR Service adminCreateService] Failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Aggiorna un servizio esistente.
   * @param {string} serviceId ID del servizio da aggiornare.
   * @param {object} serviceData Dati da aggiornare.
   * @param {object} adminCredentials Oggetto con { adminEmail, adminPassword }.
   */
  async adminUpdateService(serviceId, serviceData, adminCredentials) {
    console.log(
      `[Service adminUpdateService] Updating service ID: ${serviceId}`
    );
    const payload = { ...serviceData, ...adminCredentials };
    try {
      const response = await api.put(
        `/api/admin/services/${serviceId}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(
        `[ERROR Service adminUpdateService] Failed for ID ${serviceId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Elimina un servizio.
   * @param {string} serviceId ID del servizio da eliminare.
   * @param {object} adminCredentials Oggetto con { adminEmail, adminPassword }.
   */
  async adminDeleteService(serviceId, adminCredentials) {
    console.log(
      `[Service adminDeleteService] Deleting service ID: ${serviceId}`
    );
    try {
      // Per DELETE con Axios, i dati del "body" vanno in config.data
      const response = await api.delete(`/api/admin/services/${serviceId}`, {
        data: adminCredentials,
      });
      return response.data;
    } catch (error) {
      console.error(
        `[ERROR Service adminDeleteService] Failed for ID ${serviceId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // --- Funzioni Admin per Professionisti (Placeholder) ---
  // TODO: Implementare queste funzioni quando si aggiunge la gestione UI per i professionisti
  async adminGetProfessionals(adminCredentials) {
    console.warn("adminGetProfessionals service not fully implemented");
    // Esempio: const response = await api.get('/api/admin/professionals', { params: adminCredentials }); return response.data;
    return Promise.resolve([]); // Ritorna array vuoto per ora
  },
  async adminCreateProfessional(profData, adminCredentials) {
    console.warn("adminCreateProfessional service not fully implemented");
    // Esempio: const payload = { ...profData, ...adminCredentials }; const response = await api.post('/api/admin/professionals', payload); return response.data;
    return Promise.resolve({});
  },
  async adminUpdateProfessional(profId, profData, adminCredentials) {
    console.warn("adminUpdateProfessional service not fully implemented");
    // Esempio: const payload = { ...profData, ...adminCredentials }; const response = await api.put(`/api/admin/professionals/${profId}`, payload); return response.data;
    return Promise.resolve({});
  },
  async adminDeleteProfessional(profId, adminCredentials) {
    console.warn("adminDeleteProfessional service not fully implemented");
    // Esempio: const response = await api.delete(`/api/admin/professionals/${profId}`, { data: adminCredentials }); return response.data;
    return Promise.resolve({});
  },
};
